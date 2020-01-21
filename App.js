import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const data = {
    tasks: [
      {id: 1, name: 'Laundry', check: [false, false, false]},
      {id: 2, name: 'Tidy Room', check: [false]}
    ]
  }
  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'center', height: 40, padding: 10}}>checklist</Text>
      <Checklist tasklist={data.tasks} />
    </View>
  );
}

function Checklist(props) {
  // props.tasklist = [{id: '', name: '', check: []}, {id: '', name: '', check: []}, ...]
  const listItems = props.tasklist.map((task) =>
    <ListItem key={task.id} task={task} />
  )
  return (<View style={styles.container}>{listItems}</View>)
}

function ListItem(props) {
    // props.task = {id: '__', name: '____', check: [_, _, ..., _]}
    const checkboxes = props.task.check.map((val, i) => 
      <Text key={props.task.id + '_' + i}>{val ? 'Y' : 'N'}</Text>
    )
    return (
      <View style={styles.row}>
        <View style={{flex: 1, flexDirection: 'row'}}>{checkboxes}</View>
        <View style={{flex: 3}}><Text>{props.task.name}</Text></View>
      </View>
    )

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
