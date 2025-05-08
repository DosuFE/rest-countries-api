// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const themeText = themeToggle.querySelector('span');

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
});

function updateThemeUI(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    }
}

// API and country handling
const API_URL = 'https://restcountries.com/v3.1';
const countriesGrid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search');
const regionFilter = document.getElementById('region-filter');

let countries = [];

// Fetch all countries
async function fetchCountries() {
    try {
        const response = await fetch(`${API_URL}/all`);
        countries = await response.json();
        displayCountries(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        countriesGrid.innerHTML = '<p class="error">Failed to load countries. Please try again later.</p>';
    }
}

// Display countries in the grid
function displayCountries(countriesToShow) {
    countriesGrid.innerHTML = countriesToShow.map(country => `
        <div class="country-card" onclick="showCountryDetails('${country.cca3}')">
            <img src="${country.flags.svg}" alt="${country.flags.alt || country.name.common} flag">
            <div class="country-info">
                <h2>${country.name.common}</h2>
                <p><span>Population:</span> ${country.population.toLocaleString()}</p>
                <p><span>Region:</span> ${country.region}</p>
                <p><span>Capital:</span> ${country.capital?.[0] || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCountries = countries.filter(country => 
        country.name.common.toLowerCase().includes(searchTerm)
    );
    displayCountries(filteredCountries);
});

// Region filter
regionFilter.addEventListener('change', (e) => {
    const region = e.target.value;
    const filteredCountries = region 
        ? countries.filter(country => country.region.toLowerCase() === region)
        : countries;
    displayCountries(filteredCountries);
});

// Show country details
function showCountryDetails(cca3) {
    const country = countries.find(c => c.cca3 === cca3);
    if (!country) return;

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div class="country-details">
                <img src="${country.flags.svg}" alt="${country.flags.alt || country.name.common} flag">
                <div class="details-info">
                    <h2>${country.name.common}</h2>
                    <div class="details-grid">
                        <div>
                            <p><span>Native Name:</span> ${Object.values(country.name.nativeName || {})[0]?.common || country.name.common}</p>
                            <p><span>Population:</span> ${country.population.toLocaleString()}</p>
                            <p><span>Region:</span> ${country.region}</p>
                            <p><span>Sub Region:</span> ${country.subregion || 'N/A'}</p>
                            <p><span>Capital:</span> ${country.capital?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                            <p><span>Top Level Domain:</span> ${country.tld?.join(', ') || 'N/A'}</p>
                            <p><span>Currencies:</span> ${Object.values(country.currencies || {}).map(c => c.name).join(', ') || 'N/A'}</p>
                            <p><span>Languages:</span> ${Object.values(country.languages || {}).join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="border-countries">
                        <p><span>Border Countries:</span></p>
                        <div class="border-buttons">
                            ${country.borders?.map(border => `
                                <button onclick="showCountryDetails('${border}')">${countries.find(c => c.cca3 === border)?.name.common || border}</button>
                            `).join('') || 'None'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: var(--elements);
            padding: 2rem;
            border-radius: 5px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        .close-modal {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text);
        }
        .country-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        .country-details img {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 1rem 0;
        }
        .border-countries {
            margin-top: 2rem;
        }
        .border-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .border-buttons button {
            padding: 0.5rem 1rem;
            background: var(--elements);
            border: 1px solid var(--shadow);
            border-radius: 3px;
            cursor: pointer;
            color: var(--text);
        }
        @media (max-width: 768px) {
            .country-details {
                grid-template-columns: 1fr;
            }
            .details-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
    `;
    document.head.appendChild(style);

    // Add modal to page
    document.body.appendChild(modal);

    // Close modal functionality
    const closeModal = () => {
        modal.remove();
        style.remove();
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Initial load
fetchCountries();
