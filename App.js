import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, FlatList, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('todoapp.db');

export default class App extends Component {
  componentDidMount () {
    // create db table
    db.transaction(txn => {
      txn.executeSql(
        "create table if not exists tasks (id integer primary key autoincrement, name text, type text, numChecks integer, checksDone integer, dateChecked integer);"
      );
    });
  }
  render () {
    return (
      <View style={styles.container}>
        <Text style={{alignSelf: 'center', height: 40, padding: 10}}>checklist</Text>
        <Checklist type='daily' />
      </View>
    );
  }
}

class Checklist extends Component {
  constructor (props) {
    super(props);
    this.state = {
      text: null,
      numChecks: 1,
      tasklist: null
    }
    this.addCheck = this.addCheck.bind(this);
    this.removeCheck = this.removeCheck.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateList = this.updateList.bind(this);
    this.increaseChecks = this.increaseChecks.bind(this);
    this.decreaseChecks = this.decreaseChecks.bind(this);
  }
  componentDidMount () {
    this.updateList();
  }
  updateList () {
    // db select query on prop.type
    db.transaction(txn => {
      txn.executeSql(
        "select * from tasks where type = ?;",
        [this.props.type],
        (tx, resultSet) => {
          this.setState({tasklist: resultSet.rows._array});
          console.log(resultSet.rows._array)
        }
      );
    });
  }
  addCheck (index) {
    // db update task
    const task = this.state.tasklist[index];
    const now = Date.now();
    // if not already completely checked off
    if (task.checksDone < task.numChecks) {
      db.transaction(txn => {
        txn.executeSql(
          "update tasks set checksDone = ?, dateChecked = ? where id = ?;",
          [task.checksDone + 1, now, task.id]
        );
      }, null, this.updateList);
    }
  }
  removeCheck (index) {
    // db update task
    const task = this.state.tasklist[index];
    const now = Date.now();
    // don't decrement below zero
    if (task.checksDone > 0) {
      db.transaction(txn => {
        txn.executeSql(
          "update tasks set checksDone = ?, dateChecked = ? where id = ?;",
          [task.checksDone - 1, now, task.id]
        );
      }, null, this.updateList);
    }
  }
  createTask () {
    if (this.state.text != null) {
      db.transaction(txn => {
        txn.executeSql(
          "insert into tasks (name, type, numChecks, checksDone, dateChecked) values (?, ?, ?, 0, null)",
          [this.state.text, this.props.type, this.state.numChecks]
        );
        this.setState({text: null});
      }, null, this.updateList);
    }
  }
  increaseChecks () {
    if (this.state.numChecks < 5) {
      this.setState(state => ({numChecks: state.numChecks + 1}));
    }
  }
  decreaseChecks () {
    if (this.state.numChecks > 0) {
      this.setState(state => ({numChecks: state.numChecks - 1}));
    }
  }
  render () {
    return (
      <View style={styles.container}>
        <IntegerInput
          value={this.state.numChecks}
          increase={this.increaseChecks}
          decrease={this.decreaseChecks}
        />
        <TextInput 
          style={{height: 30, borderColor: 'gray', borderWidth: 1}} 
          onChangeText={text => {this.setState({text: text})}}
          onSubmitEditing={this.createTask}
          value={this.state.text}
        />
        <FlatList 
          data={this.state.tasklist} 
          renderItem={({item, index}) => <ListItem task={item} addCheck={() => this.addCheck(index)} removeCheck={() => this.removeCheck(index)} />} 
          keyExtractor={item => `${item.id}`} 
        />
      </View>
    );
  }
}

function IntegerInput (props) {
  
  return (
    <View style={{height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
      <TouchableHighlight style={{flex: 3}} onPress={props.decrease} underlayColor='#ddd'>
        <Text style={{alignSelf: 'center'}}>Down</Text>
      </TouchableHighlight>
      <View style={{flex: 2}}>
        <Text style={{alignSelf: 'center'}}>{props.value}</Text>
      </View>
      <TouchableHighlight style={{flex: 3}} onPress={props.increase} underlayColor='#ddd'>
        <Text style={{alignSelf: 'center'}}>Up</Text>
      </TouchableHighlight>
    </View>
  );
}

function ListItem (props) {
  const checkboxes = Array(props.task.numChecks).fill(null).map((val, i) => 
    <Text key={props.task.id + '_' + i}>{i < props.task.checksDone ? 'Y' : 'N'}</Text>
  );
  return (
    <TouchableHighlight onPress={props.addCheck} onLongPress={props.removeCheck} underlayColor='#ddd'>
      <View style={styles.row}>
        <View style={{flex: 1, flexDirection: 'row'}}>{checkboxes}</View>
        <View style={{flex: 3}}><Text>{props.task.name}</Text></View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    height: 50,
    padding: 10
  }
});
