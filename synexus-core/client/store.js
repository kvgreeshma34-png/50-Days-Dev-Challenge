class Store {
  constructor(reducer, initialState) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

const initialState = {
  user: { name: 'Greeshma K V', role: 'Lead Core Architect' },
  theme: 'light',
  feedItems: [
    '🔄 Connected to Supabase Cloud PostgreSQL persistence',
    '⚡ Event dispatcher synchronized successfully'
  ]
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FEED_ITEMS':
      return { ...state, feedItems: action.payload };
    case 'ADD_FEED_ITEM':
      return { ...state, feedItems: [action.payload, ...state.feedItems] };
    default:
      return state;
  }
}

export const globalStore = new Store(appReducer, initialState);