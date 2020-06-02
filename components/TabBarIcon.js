import * as React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function TabBarIcon(props) {
  return (
    <FontAwesome5
      name={props.name}
      size={25}
      style={{ marginBottom: -3 }}
      color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  );
}
