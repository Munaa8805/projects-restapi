import fs from 'fs';

async function downloadCountries() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,currencies,flags,area,borders,continents,independent,languages,population');
    const data = await res.json();

    fs.writeFileSync('countries.json', JSON.stringify(data, null, 2));
    console.log('countries.json saved!');
}

downloadCountries();