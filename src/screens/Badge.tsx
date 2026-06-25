import { StatusBar, Text, View } from "react-native"

const Badge: React.FC = () => {
  return (
    <View>
      <StatusBar barStyle="light-content" />*
      <Text>Badge</Text>
    </View>
  )
}

export default Badge;