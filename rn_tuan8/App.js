import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Text, View, TextInput, SafeAreaView, StyleSheet, ActivityIndicator, ScrollView, Button, TouchableOpacity } from 'react-native';

function DataComponent({ data, loading, error, onSelectItem }) {

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const limitedData = data ? data.slice(0, 20) : [];

  return (
    <ScrollView contentContainerStyle={styles.dataContainer}>
      {limitedData.map(item => (
        <TouchableOpacity key={item.id} style={styles.dataItem} onPress={() => onSelectItem(item)}>
          <Text style={styles.dataText}>{item.id}: {item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Hook để fetch dữ liệu từ API
function useFetch(URL) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // làm mới dữ liệu
  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(URL);
     // Kiểm tra dữ liệu mới
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [URL]);

  return { data, loading, error, refreshData };
}

// Hook quản lý input
function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  const onChangeText = (newValue) => {
    setValue(newValue);
  };
  return {
    value,
    onChangeText,
    setValue,
  };
}

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null); 
  const input = useInput(""); 

  // lấy dữ liệu tải lại dữ liệu
  const { data, loading, error, refreshData } = useFetch('https://6454008bc18adbbdfead590d.mockapi.io/api/v1/api_todolist');

  // Hàm để thêm mục mới
  const handleAdd = async () => {
    if (input.value.trim() === "") {
      alert("Please enter a valid title");
      return;
    }
    try {
      const response = await axios.post('https://6454008bc18adbbdfead590d.mockapi.io/api/v1/api_todolist', { title: input.value });
      
      input.setValue(""); 
      await refreshData(); 
    } catch (err) {
      console.error("Error adding item", err);
      alert("Error adding item");
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) {
      alert("Please select an item to update");
      return;
    }
    if (input.value.trim() === "") {
      alert("Please enter a valid title");
      return;
    }
    try {
      const response = await axios.put(`https://6454008bc18adbbdfead590d.mockapi.io/api/v1/api_todolist/${selectedItem.id}`, { title: input.value });
      input.setValue(""); 
      setSelectedItem(null); 
      await refreshData(); 
    } catch (err) {
      console.error("Error updating item", err);
      alert("Error updating item");
    }
  };

  // Hàm để xóa mục được chọn
  const handleDelete = async () => {
    if (!selectedItem) {
      alert("Hãy chọn mục cần xóa");
      return;
    }
    try {
      await axios.delete(`https://6454008bc18adbbdfead590d.mockapi.io/api/v1/api_todolist/${selectedItem.id}`);
      alert("Xóa item: " + selectedItem.title);
      setSelectedItem(null); // Reset mục được chọn sau khi xóa
      input.setValue(""); // Reset input
      await refreshData(); // Làm mới dữ liệu sau khi xóa
    } catch (err) {
      console.error("lỗi khi xóa item", err);
      alert("Error deleting item");
    }
  };

  // Hàm xử lý chọn 
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    input.setValue(item.title); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Todo List App</Text>

      <TextInput 
        value={input.value}
        onChangeText={input.onChangeText}
        placeholder="Enter a todo item"
        style={styles.input}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Add" onPress={handleAdd} />
        <Button title="Update" onPress={handleUpdate} />
        <Button title="Delete" onPress={handleDelete} />
      </View>

      <DataComponent data={data} loading={loading} error={error} onSelectItem={handleSelectItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dataContainer: {
    padding: 10,
  },
  dataItem: {
    backgroundColor: '#2196F3',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  dataText: {
    fontSize: 18,
    color: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
