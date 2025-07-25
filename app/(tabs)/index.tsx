import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { FAB, List, Checkbox, IconButton, Portal, Dialog, Button, TextInput, Snackbar, SegmentedButtons, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

// Task model
type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'open' | 'complete';
  priority: 'low' | 'medium' | 'high';
};

const TASKS_KEY = 'TASKS';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });
  const [snackbar, setSnackbar] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'complete'>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const router = useRouter();

  // Load tasks from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(TASKS_KEY).then(data => {
      if (data) {
        // Ensure loaded tasks have correct types
        const parsed: Task[] = JSON.parse(data).map((t: any) => ({
          ...t,
          priority: (t.priority as Task['priority']) || 'medium',
        }));
        setTasks(parsed);
      }
    });
  }, []);

  // Save tasks to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const openDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setForm({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
      });
    } else {
      setEditingTask(null);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium' });
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingTask(null);
    setForm({ title: '', description: '', dueDate: '', priority: 'medium' });
  };

  const saveTask = () => {
    if (!form.title) {
      setSnackbar('Title is required');
      return;
    }
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...form, priority: form.priority as Task['priority'] } : t));
      setSnackbar('Task updated');
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          status: 'open',
          priority: form.priority as Task['priority'],
        },
      ]);
      setSnackbar('Task added');
    }
    closeDialog();
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setSnackbar('Task deleted');
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'open' ? 'complete' : 'open' } : t));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  // Filtering, searching, and sorting
  const filteredTasks = tasks
    .filter(t =>
      (filter === 'all' || t.status === filter) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 8 }}>
        <Button mode="outlined" onPress={logout} icon="logout">
          Logout
        </Button>
      </View>
      <Searchbar
        placeholder="Search tasks"
        value={search}
        onChangeText={setSearch}
        style={{ margin: 8 }}
      />
      <SegmentedButtons
        value={filter}
        onValueChange={v => setFilter(v as any)}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'complete', label: 'Completed' },
        ]}
        style={{ marginHorizontal: 8, marginBottom: 4 }}
      />
      <SegmentedButtons
        value={sortBy}
        onValueChange={v => setSortBy(v as any)}
        buttons={[
          { value: 'dueDate', label: 'Sort by Due Date' },
          { value: 'priority', label: 'Sort by Priority' },
        ]}
        style={{ marginHorizontal: 8, marginBottom: 4 }}
      />
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <IconButton icon="delete" onPress={() => deleteTask(item.id)} />
            )}
          >
            <List.Item
              title={item.title}
              description={`${item.description} (Due: ${item.dueDate || 'N/A'})`}
              left={props => (
                <Checkbox
                  status={item.status === 'complete' ? 'checked' : 'unchecked'}
                  onPress={() => toggleComplete(item.id)}
                />
              )}
              right={props => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton icon="pencil" onPress={() => openDialog(item)} />
                </View>
              )}
              style={item.status === 'complete' ? styles.completed : undefined}
            />
          </Swipeable>
        )}
        ListEmptyComponent={<List.Item title="No tasks yet" description="Add a task to get started!" />}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => openDialog()}
        label="Add Task"
      />
      <Portal>
        <Dialog visible={showDialog} onDismiss={closeDialog}>
          <Dialog.Title>{editingTask ? 'Edit Task' : 'Add Task'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={form.title}
              onChangeText={text => setForm(f => ({ ...f, title: text }))}
              style={{ marginBottom: 8 }}
            />
            <TextInput
              label="Description"
              value={form.description}
              onChangeText={text => setForm(f => ({ ...f, description: text }))}
              style={{ marginBottom: 8 }}
            />
            <TextInput
              label="Due Date (YYYY-MM-DD)"
              value={form.dueDate}
              onChangeText={text => setForm(f => ({ ...f, dueDate: text }))}
              style={{ marginBottom: 8 }}
            />
            <TextInput
              label="Priority (low, medium, high)"
              value={form.priority}
              onChangeText={text => setForm(f => ({ ...f, priority: text }))}
              style={{ marginBottom: 8 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={saveTask}>{editingTask ? 'Update' : 'Add'}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  completed: {
    backgroundColor: '#e0e0e0',
  },
});
