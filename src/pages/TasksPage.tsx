import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTaskStore, Task } from '../store/taskStore';
import TaskList from '../components/tasks/TaskList';
import TaskQuickAdd from '../components/tasks/TaskQuickAdd';
import TaskDialog from '../components/tasks/TaskDialog';
import GridWrapper from '../utils/GridWrapper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const TasksPage: React.FC = () => {
  const { tasks, categories } = useTaskStore();
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as 'dueDate' | 'priority' | 'title');
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setFilterCategory(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddNewTask = () => {
    setEditingTask(null);
    setOpenTaskDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
  };

  const filteredAndSortedTasks = useMemo(() => {
    // Filter by tab (All, Pending, Completed)
    let filtered = [...tasks];
    if (tabValue === 1) {
      filtered = filtered.filter((task) => !task.completed);
    } else if (tabValue === 2) {
      filtered = filtered.filter((task) => task.completed);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((task) => task.category === filterCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Sort tasks
    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        // Sort by title
        return a.title.localeCompare(b.title);
      }
    });
  }, [tasks, tabValue, filterCategory, searchQuery, sortBy]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <GridWrapper item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage your tasks and stay organized.
            </Typography>
          </GridWrapper>
          <GridWrapper item xs={12} sm={4} textAlign="right">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewTask}
            >
              New Task
            </Button>
          </GridWrapper>
        </Grid>
      </Paper>

      <TaskQuickAdd />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <GridWrapper item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </GridWrapper>
          <GridWrapper item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={filterCategory}
                label="Category"
                onChange={handleCategoryChange}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridWrapper>
        </Grid>
      </Box>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Tasks" />
          <Tab label="Pending" />
          <Tab label="Completed" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">
              All Tasks ({filteredAndSortedTasks.length})
            </Typography>
            {filterCategory !== 'all' && (
              <Chip 
                label={filterCategory} 
                sx={{ ml: 2 }} 
                onDelete={() => setFilterCategory('all')}
              />
            )}
            {searchQuery && (
              <Chip 
                label={`Search: ${searchQuery}`} 
                sx={{ ml: 2 }} 
                onDelete={() => setSearchQuery('')}
              />
            )}
          </Box>
          <TaskList tasks={filteredAndSortedTasks} onEditTask={handleEditTask} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">
              Pending Tasks ({filteredAndSortedTasks.length})
            </Typography>
            {filterCategory !== 'all' && (
              <Chip 
                label={filterCategory} 
                sx={{ ml: 2 }} 
                onDelete={() => setFilterCategory('all')}
              />
            )}
          </Box>
          <TaskList tasks={filteredAndSortedTasks} onEditTask={handleEditTask} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">
              Completed Tasks ({filteredAndSortedTasks.length})
            </Typography>
            {filterCategory !== 'all' && (
              <Chip 
                label={filterCategory} 
                sx={{ ml: 2 }} 
                onDelete={() => setFilterCategory('all')}
              />
            )}
          </Box>
          <TaskList tasks={filteredAndSortedTasks} onEditTask={handleEditTask} />
        </TabPanel>
      </Paper>

      <TaskDialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
        task={editingTask}
      />
    </Box>
  );
};

export default TasksPage; 