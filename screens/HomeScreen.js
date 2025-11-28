// screens/HomeScreen.js
import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  StyleSheet 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LargeButton from '../components/LargeButton';
import useTTS from '../utils/useTTS';
import { removeToken } from '../services/authService';

export default function HomeScreen({ navigation }) {
  const { speak } = useTTS();
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      speak('Bem-vinda(o) ao Letra Viva. Escolha um módulo para começar.');
      return () => {};
    }, [])
  );

  const handleLogout = async () => {
    speak('Você apertou para sair. Deseja realmente sair da sua conta? Aperte em 1 para sair. Ou aperte em 2 para cancelar');
    setTimeout(() => {
      Alert.alert(
        'Sair',
        'Deseja realmente sair?',
        [
          { text: '2. Cancelar', style: 'cancel' },
          {
            text: '1. Sim',
            onPress: async () => {
              await removeToken();
              navigation.replace('Inicial');
            },
            style: 'destructive',
          },
        ]
      );
    }, 500);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    if (!menuVisible) {
      speak('Menu de segurança aberto. Use os botões para navegar.');
    }
  };

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Letra Viva</Text>
        
        {/* ÍCONE HAMBÚRGUER */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      {/* MÓDULOS PRINCIPAIS - 2 LINHAS DE 2 QUADRADOS */}
      <View style={styles.modulosContainer}>
        
        {/* PRIMEIRA LINHA */}
        <View style={styles.linhaModulos}>
          {/* MÓDULO 1 - PORTUGUÊS */}
          <TouchableOpacity 
            style={[styles.moduloQuadrado, { backgroundColor: '#ADD778' }]}
            onPress={() => navigation.navigate('ModuloPalavras')}
          >
            <Text style={styles.moduloEmoji}>🧩</Text>
            <Text style={styles.moduloTitulo}>Português</Text>
          </TouchableOpacity>

          {/* MÓDULO 2 - MATEMÁTICA */}
          <TouchableOpacity 
            style={[styles.moduloQuadrado, { backgroundColor: '#EC707A' }]}
            onPress={() => navigation.navigate('ModuleMatematica')}
          >
            <Text style={styles.moduloEmoji}>🧮</Text>
            <Text style={styles.moduloTitulo}>Matemática</Text>
          </TouchableOpacity>
        </View>

        {/* SEGUNDA LINHA */}
        <View style={styles.linhaModulos}>
          {/* MÓDULO 3 - TECNOLOGIA */}
          <TouchableOpacity 
            style={[styles.moduloQuadrado, { backgroundColor: '#9A5FCC' }]}
            onPress={() => navigation.navigate('ModuleTecnology')}
          >
            <Text style={styles.moduloEmoji}>📱</Text>
            <Text style={styles.moduloTitulo}>Tecnologia</Text>
          </TouchableOpacity>

          {/* MÓDULO 4 - JOGOS */}
          <TouchableOpacity 
            style={[styles.moduloQuadrado, { backgroundColor: '#FEE78D' }]}
            onPress={() => navigation.navigate('ModuloJogos')}
          >
            <Text style={styles.moduloEmoji}>🎮</Text>
            <Text style={styles.moduloTitulo}>Jogos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DO MENU DE SEGURANÇA */}
      {/* MODAL DO MENU DE SEGURANÇA */}
<Modal
  visible={menuVisible}
  transparent
  animationType="slide"
  onRequestClose={toggleMenu}
>
  <View style={styles.modalOverlay}>
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitulo}>Menu de Segurança</Text>
      
      <View style={styles.menuContent}>
       <LargeButton
          title="🔒 Sair da Conta"
          color="#FF6B6B"
          onPress={() => {
            setMenuVisible(false);
            handleLogout();
          }}
        />
      </View>

      <TouchableOpacity style={styles.fecharMenu} onPress={toggleMenu}>
        <Text style={styles.fecharTexto}>Fechar Menu</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#474b4e',
  },
  menuButton: {
    padding: 10,
  },
  menuLine: {
    width: 25,
    height: 3,
    backgroundColor: '#474b4e',
    marginVertical: 2,
    borderRadius: 2,
  },
  modulosContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
linhaModulos: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 30, // Aumentei o espaçamento entre linhas
},
  moduloQuadrado: {
    width: 150,
    height: 150,
    marginHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  moduloEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  moduloNumero: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moduloTitulo: {
    fontSize: 16,
    color: '#474b4e',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFDF7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  menuTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuScroll: {
    maxHeight: 400,
  },
  fecharMenu: {
    backgroundColor: '#4A88E0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  fecharTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContent: {
  alignItems: 'center',
  justifyContent: 'center',
},
});