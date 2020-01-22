import Vue from 'vue';

import fetch from '../../fetch';


export default {
  namespaced: true,
  state: {
    all: [],
    subtotal: 0,
    total: 0,
  },
  getters: {
    getSelectEntries: state => {
      return state.all.map(entry => {
        return {id: entry.url, text: entry.name};
      });
    },
    getEntriesByDay: state => {
      let allDays = [];
      for (let i = 0; i < 14; i++) {
        let day = Vue.prototype.$moment().subtract(i, 'day').format('YYYY-MM-DD');
        allDays.push(day);
      }

      return allDays.map(date => {
        let day = {
          date: date,
          duration: 0,
          entries: state.all.filter(entry => {
            return entry.date == date;
          }),
        };
        day.entries.forEach(entry => {
          day.duration += entry.duration;
        });
        return day;
      });
    },
    getEntriesByDayTotal: (state, getters) => {
      let entriesByDayTotal = 0;
      getters.getEntriesByDay.forEach(day => {
        entriesByDayTotal += day.duration;
      });
      return entriesByDayTotal;
    },
  },
  mutations: {
    setEntries: (state, entries) => state.all = entries,
    setTotal: (state, total) => state.total = total,
    setSubtotal: (state, subtotal) => state.subtotal = subtotal,
    addEntry: (state, entry) => state.all.unshift(entry),
    updateEntry: (state, opts) => Vue.set(state.all, opts.index, opts.entry),
    removeEntry: (state, index) => Vue.delete(state.all, index),
  },
  actions: {
    fetchEntries({commit}) {
      commit('addLoading', 'entries', {root: true});
      let getOptions = {
        params: {
          user: timestrapConfig.USER.ID,
          min_date: Vue.prototype.$moment().subtract(5, 'day').format('YYYY-MM-DD'),
          max_date: Vue.prototype.$moment().format('YYYY-MM-DD'),
        },
      };
      fetch.get(timestrapConfig.API_URLS.ENTRIES, getOptions).then(response => {
        commit('setEntries', response.data.results);
        commit('setTotal', response.data.total_duration);
        commit('setSubtotal', response.data.subtotal_duration);
        commit('removeLoading', 'entries', {root: true});
      }).catch(error => console.log(error));
    },
    createEntry({commit}, entry) {
      fetch.post(timestrapConfig.API_URLS.ENTRIES, entry).then(response => {
        commit('addEntry', response.data);
        Vue.prototype.$bus.$emit('toast', {
          title: 'New Entry Added',
          message: 'Your new entry has been successfully added.',
        });
      }).catch(error => console.log(error));
    },
    editEntry({commit, state}, entry) {
      fetch.put(entry.url, entry).then(response => {
        const index = state.all.findIndex(item => {
          return item.id === response.data.id;
        });
        commit('updateEntry', {index: index, entry: response.data});
      }).catch(error => console.log(error));
    },
    deleteEntry({commit, state}, entry) {
      const index = state.all.findIndex(item => {
        return item.id === entry.id;
      });
      fetch.delete(state.all[index].url).then(() => {
        commit('removeEntry', index);
      }).catch(error => console.log(error));
    },
  },
};
