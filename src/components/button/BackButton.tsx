import { useNavigation } from "@react-navigation/native"
import { TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

interface Props {
  route? : string
}

const BackButton : React.FC<Props> = ({ route } : Props) => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      onPress={() => {
        if (route) {
          navigation.navigate(route as never);
        } else {
          navigation.goBack();
        }
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="arrow-back" size={16} color="#4B5563" />
    </TouchableOpacity>
  )
}

export default BackButton