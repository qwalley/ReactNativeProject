import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';

export default function App() {
  const tasks = [
    {id: 1, name: 'Laundry', numChecks: 1},
    {id: 2, name: 'Tidy', numChecks: 3}
  ]
  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'center', height: 40, padding: 10}}>checklist</Text>
      <Checklist tasklist={tasks} />
    </View>
  );
}

function Checklist(props) {
  const listItems = props.tasklist.map((task, i) => 
    <ListItem key={task.id} task={task} />
  )
  return (<View style={styles.container}>{listItems}</View>)
}

class ListItem extends Component {
    constructor(props) {
      super(props)
      this.addCheck = this.addCheck.bind(this)
      this.state = {
        checksDone: 0
      }
    }
    addCheck() {
      this.setState(state => ({checksDone: state.checksDone + 1}))
    }
    render() {
      const checkboxes = Array(this.props.task.numChecks).fill(null).map((val, i) => 
        <Text key={this.props.task.id + '_' + i}>{i < this.state.checksDone ? 'Y' : 'N'}</Text>
      )
      return (
        <TouchableHighlight onPress={this.addCheck} underlayColor='#ddd'>
          <View style={styles.row}>
            <View style={{flex: 1, flexDirection: 'row'}}>{checkboxes}</View>
            <View style={{flex: 3}}><Text>{this.props.task.name}</Text></View>
          </View>
        </TouchableHighlight>
      )
    }

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
