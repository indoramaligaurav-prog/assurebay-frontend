import * as api from 'src/services';

export const Countries = async () => {

        const {data} = await api.Allcountries();

        return data;

};