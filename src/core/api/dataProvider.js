// src/core/dataProvider.js
import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';
import { tokenStore } from './utils/tokenStore';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ 'Content-Type': 'application/json' });
    }
    const token = tokenStore.get();
    if (token) options.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
};

const dataProvider = simpleRestProvider('http://localhost:9000/', httpClient);

export default dataProvider;
