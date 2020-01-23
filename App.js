import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, FlatList } from 'react-native';

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
  return (
    <View style={styles.container}>
      <FlatList data={props.tasklist} renderItem={({item}) => <ListItem task={item} />} keyExtractor={item => `${item.id}`} />
    </View>
  )
}

class ListItem extends Component {
    constructor(props) {
      super(props)
      this.addCheck = this.addCheck.bind(this)
      this.removeCheck = this.removeCheck.bind(this)
      this.state = {
        checksDone: 0
      }
    }
    addCheck() {
      this.setState(state => ({checksDone: state.checksDone < this.props.task.numChecks ? state.checksDone + 1 : state.checksDone}))
    }
    removeCheck() {
      this.setState(state => ({checksDone: state.checksDone > 0 ? state.checksDone - 1 : 0}))
    }
    render() {
      const checkboxes = Array(this.props.task.numChecks).fill(null).map((val, i) => 
        <Text key={this.props.task.id + '_' + i}>{i < this.state.checksDone ? 'Y' : 'N'}</Text>
      )
      return (
        <TouchableHighlight onPress={this.addCheck} onLongPress={this.removeCheck} underlayColor='#ddd'>
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
