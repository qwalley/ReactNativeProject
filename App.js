import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('todoapp.db');

export default class App extends Component {
  componentDidMount () {
    // create db table
    db.transaction(txn => {
      txn.executeSql(
        "create table if not exists tasks (id integer primary key not null, name text, type text, numChecks int, checksDone int, dateChecked text);"
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
      tasklist: null
      this.addCheck = this.addCheck.bind(this);
      this.removeCheck = this.removeCheck.bind(this);
    }
    componentDidMount () {
      updateList();
    }
    updateList () {
      // db select query on prop.type
    }
    addCheck (id) {
      // db update task
      // this.setState(state => ({checksDone: state.checksDone < this.props.task.numChecks ? state.checksDone + 1 : state.checksDone}));
    }
    removeCheck (id) {
      // db update task
      // this.setState(state => ({checksDone: state.checksDone > 0 ? state.checksDone - 1 : 0}));
    }
  }
  render () {
    return (
      <View style={styles.container}>
        <FlatList 
          data={this.state.tasklist} 
          renderItem={({item}) => <ListItem task={item} addCheck={() => this.addCheck(item.id)} removeCheck={() => this.removeCheck(item.id)} />} 
          keyExtractor={item => `${item.id}`} 
        />
      </View>
    );
  }
}

ListItem (props) {
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
