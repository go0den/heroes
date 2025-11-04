// script.js
const GOOGLE_SHEET_ID = '1fCv50TBwrxraXDEgGiT7DKyuDKhoJg4fdPTPVWyhQ6Q';
const SHEET_NAME = 'Лист1';

async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<div class="loading"><p>Загрузка историй о героях...</p></div>';
    
    try {
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки таблицы');
        
        const text = await response.text();
        if (!text || text.length < 50) throw new Error('Таблица пустая или не найдена');
        
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const heroes = [];
        const rows = json.table.rows;
        
        if (!rows || rows.length === 0) {
            throw new Error('В таблице нет данных');
        }
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].c;
            
            if (!cells || cells.every(cell => !cell || (!cell.v && !cell.f))) {
                continue;
            }
            
            const name = cells[0] ? (cells[0].v || '') : '';
            const info = cells[1] ? (cells[1].v || '') : '';
            const image = cells[2] ? (cells[2].v || '') : '';
            
            if (!name) {
                continue;
            }
            
            heroes.push({
                name: name.toString(),
                info: info.toString(),
                image: image.toString()
            });
        }
        
        displayHeroes(heroes);
        
    } catch (error) {
        console.error('Ошибка загрузки историй:', error);
        newsContainer.innerHTML = `
            <div class="error">
                <p>Не удалось загрузить истории героев</p>
                <p><small>${error.message}</small></p>
                <p>Проверьте:</p>
                <ul style="text-align: left; margin: 0.5rem 0;">
                    <li>Таблица доступна по ссылке</li>
                    <li>Данные есть на листе "${SHEET_NAME}"</li>
                    <li>Формат: Ф.И.О | Информация | Фото (URL)</li>
                </ul>
            </div>
        `;
    }
}

function displayHeroes(heroes) {
    const newsContainer = document.getElementById('news-container');
    
    if (heroes.length === 0) {
        newsContainer.innerHTML = '<div class="loading"><p>Историй о героях пока нет. Добавьте данные в таблицу.</p></div>';
        return;
    }
    
    newsContainer.innerHTML = '';
    
    heroes.forEach((hero, index) => {
        const heroItem = document.createElement('div');
        heroItem.className = 'hero-item';
        
        let infoHtml = hero.info;
        
        if (infoHtml.includes('\n')) {
            infoHtml = infoHtml.split('\n').map(line => {
                return line.trim() ? line + '<br>' : '';
            }).join('');
        }
        
        heroItem.innerHTML = `
            <div class="hero-content">
                <div class="hero-text">
                    <h3>${hero.name}</h3>
                    <div class="hero-info">${infoHtml}</div>
                </div>
                ${hero.image ? `
                <div class="hero-image-container">
                    <img src="${hero.image}" class="hero-image" alt="${hero.name}" onerror="this.style.display='none'">
                </div>
                ` : ''}
            </div>
        `;
        
        newsContainer.appendChild(heroItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});
