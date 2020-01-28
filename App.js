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
      <View style={[styles.bg, {flex: 1, paddingTop: 15}]}>
        <Text style={[styles.bg, styles.title]}>/*   TODO   */</Text>
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
      deleteToggled: false,
      tasklist: null
    }
    this.addCheck = this.addCheck.bind(this);
    this.removeCheck = this.removeCheck.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateList = this.updateList.bind(this);
    this.increaseChecks = this.increaseChecks.bind(this);
    this.decreaseChecks = this.decreaseChecks.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
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
  deleteTask (index) {
    const task = this.state.tasklist[index];
    db.transaction(txn => {
      txn.executeSql(
        "delete from tasks where id = ?;",
        [task.id]
      );
    }, null, this.updateList);
  }
  render () {
    return (
      <View style={{flex: 1}}>
        <AddComponentDropdown
          frequencyInput={<IntegerInput value={this.state.numChecks} increase={this.increaseChecks} decrease={this.decreaseChecks} />}
          nameInput={<TextInput style={[styles.TextInput, styles.yellow]} onChangeText={text => {this.setState({text: text})}} onSubmitEditing={this.createTask} value={this.state.text}/>}
        />
        <TouchableHighlight style={[styles.border, styles.box]} underlayColor='#555' onPress={() => {this.setState((oldState) => ({deleteToggled: !oldState.deleteToggled}))}}>
          <Text style={styles.red}>Delete Task</Text>
        </TouchableHighlight>
        <FlatList 
          data={this.state.tasklist} 
          renderItem={({item, index}) => <ListItem task={item} deleteToggled={this.state.deleteToggled} addCheck={() => this.addCheck(index)} removeCheck={() => this.removeCheck(index)} deleteTask={() => this.deleteTask(index)} />} 
          keyExtractor={item => `${item.id}`} 
        />
      </View>
    );
  }
}

function IntegerInput (props) {  
  return (
    <View style={[styles.IntegerInput, styles.border]}>
      <TouchableHighlight style={[styles.IntegerInputChild, {flex: 3}]} onPress={props.decrease} underlayColor='#555'>
        <Text style={styles.buttonSymbols}>-</Text>
      </TouchableHighlight>
      <View style={[styles.IntegerInputChild, styles.leftRightBorder, {flex: 2}]}>
        <Text style={styles.grey}>{props.value}</Text>
      </View>
      <TouchableHighlight style={[styles.IntegerInputChild, {flex: 3}]} onPress={props.increase} underlayColor='#555'>
        <Text style={[styles.buttonSymbols]}>+</Text>
      </TouchableHighlight>
    </View>
  );
}

function ListItem (props) {
  const checkboxes = Array(props.task.numChecks).fill(null).map((val, i) => 
    <View key={props.task.id + '_' + i} style={[styles.checkBox, i < props.task.checksDone ? styles.checkN : styles.checkY]}></View>
  );
  const checkBoxSection = (
    <View style={[styles.checks, {flex: 1}]}>
      {checkboxes}
    </View>
  );
  const deleteTaskSection = (
    <TouchableHighlight style={[styles.checks, {flex: 1, justifyContent: 'center'}]} underlayColor='#555' onPress={props.deleteTask}>
      <Text style={[styles.red]}>delete</Text>
    </TouchableHighlight>
  )
  return (
    <TouchableHighlight disabled={props.deleteToggled} onPress={props.addCheck} onLongPress={props.removeCheck} underlayColor='#555' style={{margin: 5, borderRadius: 2}}>
      <View style={[styles.listItem, styles.border]}>
        {props.deleteToggled ? deleteTaskSection : checkBoxSection}
        <View style={[styles.leftAlignLabel, {flex: 4}]}>
          <Text style={styles.yellow}>{props.task.name}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

function AddComponentDropdown (props) {
  return (
    <View style={[styles.border, {margin: 5}]}>
      <ExpandingView startOpen={false} >
        <View style={[{padding: 5, alignSelf: 'center'}]}>
          <Text style={styles.blue}>Add New Task</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={[styles.leftAlignLabel, {flex: 1}]}><Text style={styles.grey}>Frequency</Text></View>
          <View style={{flex: 3}}>
            {props.frequencyInput}
          </View>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={[styles.leftAlignLabel, {flex: 1}]}><Text style={styles.grey}>Name</Text></View>
          <View style={{flex: 3}}>
            {props.nameInput}
          </View>
        </View>
      </ExpandingView>
    </View>
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
      <TouchableHighlight onPress={this.toggleExpand} underlayColor='#555'>
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
  bg: {
    backgroundColor: '#333'
  },
  yellow: {
    color: '#ba7'
  },
  blue: {
    color: '#6ad'
  },
  grey: {
    color: '#bbb'
  },
  red: {
    color: '#b57'
  },
  buttonSymbols: {
    fontWeight: '500', 
    fontSize: 20,
    color: '#6ad',
    marginTop: -2
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
  title: {
    alignSelf: 'center', 
    padding: 5, 
    fontSize: 25, 
    color: '#999'
  },
  box: {
    margin: 5, 
    padding: 5, 
    alignItems: 'center'
  },
  TextInput: {
    height: 30,
    margin: 5,
    padding: 5,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  listItem: {
    flexDirection: 'row',
    height: 40,
    // margin: 5,
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
    borderColor: '#aaa', 
    margin: 1,
  },
  checkN: {
    backgroundColor: '#aaa',
    // backgroundColor: '#4a0',
  },
  checkY: {
    // backgroundColor: '#333',
  }
});
