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
      <View style={{flex: 1, backgroundColor: '#333', marginTop: 10}}>
        <Text style={{alignSelf: 'center', padding: 5, fontSize: 25, color: '#666'}}>/*   TODO   */</Text>
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
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={[styles.border, {margin: 5}]}>
          <ExpandingView startOpen={false} >
            <View style={[{padding: 5, alignSelf: 'center'}]}><Text>Add New Task</Text></View>
            <View style={{flexDirection: 'row'}}>
              <View style={[styles.leftAlignLabel, {flex: 1}]}><Text>Frequency</Text></View>
              <View style={{flex: 3}}>
                <IntegerInput value={this.state.numChecks} increase={this.increaseChecks} decrease={this.decreaseChecks} />
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={[styles.leftAlignLabel, {flex: 1}]}><Text>Name</Text></View>
              <View style={{flex: 3}}>
                <TextInput style={styles.TextInput} onChangeText={text => {this.setState({text: text})}} onSubmitEditing={this.createTask} value={this.state.text}/>
              </View>
            </View>
          </ExpandingView>
        </View>
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
    <View style={[styles.IntegerInput, styles.border]}>
      <TouchableHighlight style={[styles.IntegerInputChild, {flex: 3}]} onPress={props.decrease} underlayColor='#ddd'>
        <Text>Down</Text>
      </TouchableHighlight>
      <View style={[styles.IntegerInputChild, styles.leftRightBorder, {flex: 2}]}>
        <Text>{props.value}</Text>
      </View>
      <TouchableHighlight style={[styles.IntegerInputChild, {flex: 3}]} onPress={props.increase} underlayColor='#ddd'>
        <Text>Up</Text>
      </TouchableHighlight>
    </View>
  );
}

function ListItem (props) {
  const checkboxes = Array(props.task.numChecks).fill(null).map((val, i) => 
    <View key={props.task.id + '_' + i} style={[styles.checkBox, i < props.task.checksDone ? styles.checkN : styles.checkY]}></View>
  );
  return (
    <TouchableHighlight onPress={props.addCheck} onLongPress={props.removeCheck} underlayColor='#ddd'>
      <View style={[styles.listItem, styles.border]}>
        <View style={[styles.checks, {flex: 1}]}>
          {checkboxes}
        </View>
        <View style={[styles.leftAlignLabel, {flex: 4}]}>
          <Text>{props.task.name}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

class ExpandingView extends Component {
  constructor (props) {
    super(props);
    this.state = {
      expanded: props.startOpen,
    }
    this.toggleExpand = this.toggleExpand.bind(this);
  }
  toggleExpand () {
    this.setState((oldstate) => ({expanded: !oldstate.expanded}));
  }
  render () {
    return (
      <TouchableHighlight onPress={this.toggleExpand} underlayColor='#fff'>
        <View>
          {React.Children.map(this.props.children, (child, index) => index === 0 || this.state.expanded ? child : null)}
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  border: {
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  leftRightBorder: {
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: 'gray',
  },
  leftAlignLabel: {
    justifyContent: 'center',
    padding: 5,
  },
  TextInput: {
    height: 30,
    margin: 5,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  listItem: {
    flexDirection: 'row',
    height: 40,
    margin: 5,
  },
  checks: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    borderRightWidth: 0.5,
    borderColor: 'gray',
    marginLeft: -2
  },
  IntegerInput: {
    height: 30,
    flexDirection: 'row',  
    alignItems: 'stretch',
    margin: 5,
  },
  IntegerInputChild: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBox : {
    width: 10, 
    height: 10, 
    borderRadius: 2, 
    borderWidth: 1, 
    borderColor: '#555', 
    margin: 1,
  },
  checkN: {
    backgroundColor: '#6b8',
  },
  checkY: {
    backgroundColor: '#fff',
  }
});
