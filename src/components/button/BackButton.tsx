import { useNavigation } from "@react-navigation/native"
import { TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

interface Props {
  route? : string
  param? : any
}

const BackButton : React.FC<Props> = ({ route, param } : Props) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => {
        if (route) {
          navigation.navigate(route, param);
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