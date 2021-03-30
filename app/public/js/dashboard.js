var CIELAB = '#cielab-view',
    BARCHART = '#barchart-view',
    VOLUME = '#volume-view',
    GRAPH = '#graph-view',
    TOOLTIP = '#tooltip';
    HELP_TOOLTIP = '#help-tooltip';

var first_load = true; 
var slider_trigger = false; // true when graph update is triggered by slider
const default_year_range = { begin: 1200, end: 1850 }

var parameters = {
    artist_nationality: '',
    artwork_type: '',
    general_type: '',
    school: '',
    century: '',
    creation_year: { begin: 1200, end: 1850 }
}

var message = {
    'first_load': first_load, 
    'parameters': parameters
}

function sendWebSocketMessage() {
    console.log('Submitting selection')
    console.log('Parameters: ', parameters)

    message.parameters = parameters
    ws.send(JSON.stringify(message))
}
var options;

// SORTING UTILITY
const dsu = (arr1, arr2) => arr1
    .map((item, index) => [arr2[index], item]) // add the args to sort by
    .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
    .map(([, item]) => item); // extract the sorted items

// OPTIONS

// Give radio-like behavior to century buttons
$(document).on('click', '.century-button.active', function() {
    //Remove active class from all buttons
    $('.century-button.active').removeClass('selected');

    //Add active class to the clicked button
    $(this).addClass('selected');


    parameters["century"] = $(this)[0].value
    parameters["creation_year"]["begin"] = (parameters["century"] * 100) - 100;
    parameters["creation_year"]["end"] = (parameters["century"] * 100) - 1;

    console.log('Century selected: ', $(this)[0].value)
    console.log('param century: ', parameters["century"])

    if (!slider_trigger) {
        slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
    } else {
        slidder_trigger = false;
    }

    sendWebSocketMessage()
 });

 // Submit function for dropdown menus
function submitSelected(option) {
    parameters[option.id]= option.value

    sendWebSocketMessage()
}

function submitPreSelection(option) {
    console.log(option)
    switch (option) {
        case 1.1:
            parameters["century"] = '17.0'
            parameters["artist_nationality"] = ''
            parameters["artwork_type"] = 'portrait'
            parameters["school"] = ''
            parameters["general_type"] = ''
            parameters["creation_year"]["begin"] = (parameters["century"] * 100) - 100;
            parameters["creation_year"]["end"] = (parameters["century"] * 100) - 1;
            slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
            break;
        case 1.2:
            parameters["century"] = '19.0'
            parameters["artist_nationality"] = ''
            parameters["artwork_type"] = 'portrait'
            parameters["school"] = ''
            parameters["general_type"] = ''
            parameters["creation_year"]["begin"] = (parameters["century"] * 100) - 100;
            parameters["creation_year"]["end"] = (parameters["century"] * 100) - 1;
            slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
            break;
        case 2.1:
            parameters["century"] = ''
            parameters["artist_nationality"] = 'Japan'
            parameters["artwork_type"] = ''
            parameters["school"] = ''
            parameters["general_type"]= ''
            parameters["creation_year"] = { begin: 1600, end: 1799 }
            slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
            break;
            case 2.2:
                parameters["century"] = ''
                parameters["artist_nationality"] = 'Netherlands'
                parameters["artwork_type"] = ''
                parameters["school"] = ''
                parameters["general_type"]= ''
                parameters["creation_year"] = { begin: 1600, end: 1799 }
                slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
                break;
        case 3:
            parameters["century"] = '20.0'
            parameters["artist_nationality"] = 'United States'
            parameters["artwork_type"] = ''
            parameters["school"] = ''
            parameters["general_type"]= ''
            parameters["creation_year"]["begin"] = (parameters["century"] * 100) - 100;
            parameters["creation_year"]["end"] = (parameters["century"] * 100) - 1;
            slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
            break;
    }

    console.log('Submitting Pre-Selection with params: ', parameters)
    sendWebSocketMessage()
}

function reset(option) {
    switch (option.id) {
        case 'reset-century':
            $('.century-button').removeClass('selected')
            parameters["creation_year"] = $.extend({}, default_year_range)
            parameters["century"] = ''
            break;
        case  'reset-school':
            parameters["school"] = ''
            break;
        case 'reset-artwork-type':
            parameters["artwork_type"] = ''
            break;
        case 'reset-general-type':
            parameters["general_type"]= ''
            break;
        case 'reset-artist-nationality':
            parameters["artist_nationality"] = ''
            break;
    }

    sendWebSocketMessage()
}

function resetAllOptions() {
    parameters["century"] = ''
    parameters["artist_nationality"] = ''
    parameters["artwork_type"] = ''
    parameters["school"] = ''
    parameters["general_type"]= ''

    let year_range = $.extend({}, default_year_range)
    parameters["creation_year"] = year_range
    slider.range(year_range.begin, year_range.end)

    console.log('Parameters on reset: ', parameters)
    $('.century-button').removeClass('selected')
    sendWebSocketMessage();
}


// Data loading
window.onload = () => {
    // Initialize the views
    cielab_view();
    volume_view();
    graph_view();
    barchart_view();
    
    ws.onopen = () => {        
        ws.send(JSON.stringify(message))
        message.first_load = false;
        
        console.log("Socket open")
    };

}

// Define websocket
var ws = new WebSocket('ws://localhost:40510');

// Listen to messages from backend
ws.onmessage = (ev) => {
    message = JSON.parse(ev.data);
    options = message['options'];

    if (!message['unchanged']) {
        console.log('Updating graphs');
        update_cielab(message['graph_data']);
        update_graph(message['graph_data']);
        update_volume(message['graph_data']);
        update_barchart(message['graph_data']);

        update_options(message['options']);
        slider.updateHist(values, 0);
    }
}

// Slider + Histogram
var values = [2021, 891.0, 2015.0, 2014.0, 2013.0, 2010.0, 2010.0, 2009.0, 2007.0, 2007.0, 2006.0, 2006.0, 2006.0, 2003.0, 2003.0, 2003.0, 2001.0, 2000.0, 1999.0, 1999.0, 1997.0, 1995.0, 1994.0, 1994.0, 1992.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1990.0, 1989.0, 1989.0, 1988.0, 1988.0, 1988.0, 1988.0, 1987.0, 1986.0, 1986.0, 1984.0, 1984.0, 1984.0, 1983.0, 1982.0, 1981.0, 1981.0, 1980.0, 1980.0, 1980.0, 1979.0, 1979.0, 1979.0, 1979.0, 1978.0, 1977.0, 1977.0, 1976.0, 1976.0, 1975.0, 1975.0, 1974.0, 1974.0, 1973.0, 1972.0, 1972.0, 1972.0, 1972.0, 1971.0, 1971.0, 1971.0, 1971.0, 1971.0, 1970.0, 1970.0, 1970.0, 1970.0, 1969.0, 1969.0, 1969.0, 1969.0, 1969.0, 1968.0, 1968.0, 1968.0, 1967.0, 1967.0, 1967.0, 1967.0, 1967.0, 1966.0, 1966.0, 1965.0, 1965.0, 1965.0, 1965.0, 1964.0, 1964.0, 1964.0, 1963.0, 1963.0, 1962.0, 1960.0, 1960.0, 1960.0, 1959.0, 1959.0, 1958.0, 1958.0, 1958.0, 1958.0, 1958.0, 1957.0, 1957.0, 1956.0, 1956.0, 1956.0, 1956.0, 1956.0, 1954.0, 1954.0, 1952.0, 1952.0, 1951.0, 1951.0, 1951.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1950.0, 1948.0, 1948.0, 1947.0, 1947.0, 1946.0, 1945.0, 1945.0, 1945.0, 1944.0, 1944.0, 1943.0, 1943.0, 1943.0, 1942.0, 1941.0, 1940.0, 1940.0, 1940.0, 1939.0, 1938.0, 1937.0, 1936.0, 1936.0, 1936.0, 1935.0, 1935.0, 1935.0, 1935.0, 1934.0, 1934.0, 1934.0, 1934.0, 1934.0, 1934.0, 1934.0, 1933.0, 1932.0, 1932.0, 1932.0, 1931.0, 1931.0, 1931.0, 1931.0, 1931.0, 1931.0, 1931.0, 1930.0, 1930.0, 1930.0, 1930.0, 1929.0, 1929.0, 1928.0, 1928.0, 1928.0, 1927.0, 1927.0, 1927.0, 1927.0, 1927.0, 1927.0, 1926.0, 1926.0, 1926.0, 1925.0, 1925.0, 1925.0, 1924.0, 1924.0, 1924.0, 1924.0, 1924.0, 1924.0, 1923.0, 1923.0, 1923.0, 1922.0, 1922.0, 1922.0, 1922.0, 1922.0, 1921.0, 1921.0, 1921.0, 1921.0, 1920.0, 1920.0, 1920.0, 1920.0, 1920.0, 1920.0, 1920.0, 1919.0, 1919.0, 1919.0, 1919.0, 1919.0, 1918.0, 1918.0, 1918.0, 1918.0, 1917.0, 1917.0, 1917.0, 1917.0, 1917.0, 1916.0, 1916.0, 1916.0, 1916.0, 1916.0, 1916.0, 1915.0, 1915.0, 1915.0, 1914.0, 1914.0, 1914.0, 1914.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1913.0, 1912.0, 1912.0, 1912.0, 1912.0, 1912.0, 1912.0, 1912.0, 1912.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1911.0, 1910.0, 1910.0, 1910.0, 1910.0, 1910.0, 1910.0, 1910.0, 1910.0, 1910.0, 1909.0, 1909.0, 1909.0, 1908.0, 1908.0, 1908.0, 1908.0, 1908.0, 1908.0, 1908.0, 1908.0, 1908.0, 1907.0, 1907.0, 1907.0, 1907.0, 1906.0, 1906.0, 1906.0, 1905.0, 1905.0, 1905.0, 1905.0, 1904.0, 1904.0, 1904.0, 1904.0, 1904.0, 1904.0, 1903.0, 1903.0, 1903.0, 1902.0, 1902.0, 1902.0, 1902.0, 1902.0, 1901.0, 1901.0, 1901.0, 1901.0, 1900.0, 1900.0, 1900.0, 1899.0, 1899.0, 1899.0, 1899.0, 1899.0, 1899.0, 1899.0, 1898.0, 1898.0, 1898.0, 1898.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1897.0, 1896.0, 1896.0, 1896.0, 1896.0, 1895.0, 1895.0, 1895.0, 1895.0, 1895.0, 1895.0, 1895.0, 1894.0, 1894.0, 1894.0, 1894.0, 1894.0, 1893.0, 1893.0, 1893.0, 1893.0, 1893.0, 1893.0, 1892.0, 1892.0, 1892.0, 1892.0, 1892.0, 1891.0, 1891.0, 1891.0, 1891.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1890.0, 1889.0, 1889.0, 1889.0, 1889.0, 1889.0, 1889.0, 1889.0, 1889.0, 1889.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1888.0, 1887.0, 1887.0, 1887.0, 1887.0, 1887.0, 1887.0, 1886.0, 1886.0, 1886.0, 1886.0, 1886.0, 1886.0, 1886.0, 1886.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1885.0, 1884.0, 1884.0, 1884.0, 1884.0, 1884.0, 1884.0, 1884.0, 1884.0, 1884.0, 1883.0, 1883.0, 1883.0, 1883.0, 1883.0, 1882.0, 1882.0, 1882.0, 1882.0, 1882.0, 1882.0, 1881.0, 1881.0, 1881.0, 1881.0, 1881.0, 1881.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1880.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1879.0, 1878.0, 1878.0, 1878.0, 1878.0, 1878.0, 1877.0, 1877.0, 1877.0, 1877.0, 1877.0, 1876.0, 1876.0, 1876.0, 1876.0, 1876.0, 1876.0, 1876.0, 1875.0, 1875.0, 1875.0, 1875.0, 1875.0, 1875.0, 1875.0, 1875.0, 1874.0, 1874.0, 1874.0, 1874.0, 1874.0, 1874.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1873.0, 1872.0, 1872.0, 1872.0, 1871.0, 1871.0, 1870.0, 1870.0, 1870.0, 1870.0, 1870.0, 1869.0, 1869.0, 1869.0, 1868.0, 1868.0, 1868.0, 1867.0, 1867.0, 1866.0, 1866.0, 1866.0, 1866.0, 1866.0, 1866.0, 1865.0, 1865.0, 1865.0, 1865.0, 1864.0, 1864.0, 1863.0, 1863.0, 1862.0, 1862.0, 1862.0, 1861.0, 1860.0, 1860.0, 1860.0, 1860.0, 1860.0, 1859.0, 1857.0, 1855.0, 1855.0, 1854.0, 1854.0, 1852.0, 1852.0, 1852.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1850.0, 1849.0, 1849.0, 1847.0, 1847.0, 1846.0, 1845.0, 1845.0, 1844.0, 1843.0, 1843.0, 1843.0, 1843.0, 1842.0, 1842.0, 1840.0, 1838.0, 1838.0, 1837.0, 1836.0, 1834.0, 1833.0, 1833.0, 1833.0, 1833.0, 1832.0, 1832.0, 1830.0, 1830.0, 1829.0, 1829.0, 1828.0, 1826.0, 1825.0, 1825.0, 1825.0, 1824.0, 1823.0, 1820.0, 1819.0, 1819.0, 1813.0, 1813.0, 1811.0, 1811.0, 1811.0, 1811.0, 1811.0, 1810.0, 1805.0, 1802.0, 1801.0, 1800.0, 1800.0, 1800.0, 1800.0, 1800.0, 1800.0, 1800.0, 1799.0, 1799.0, 1798.0, 1798.0, 1796.0, 1793.0, 1793.0, 1793.0, 1791.0, 1790.0, 1790.0, 1790.0, 1790.0, 1790.0, 1790.0, 1789.0, 1789.0, 1789.0, 1787.0, 1786.0, 1786.0, 1781.0, 1779.0, 1778.0, 1775.0, 1775.0, 1773.0, 1768.0, 1760.0, 1759.0, 1758.0, 1758.0, 1757.0, 1756.0, 1756.0, 1756.0, 1756.0, 1755.0, 1755.0, 1754.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1750.0, 1748.0, 1748.0, 1745.0, 1743.0, 1742.0, 1740.0, 1738.0, 1736.0, 1723.0, 1720.0, 1720.0, 1717.0, 1714.0, 1714.0, 1712.0, 1712.0, 1712.0, 1708.0, 1708.0, 1700.0, 1696.0, 1691.0, 1690.0, 1690.0, 1690.0, 1690.0, 1686.0, 1685.0, 1680.0, 1673.0, 1669.0, 1665.0, 1665.0, 1663.0, 1662.0, 1660.0, 1657.0, 1656.0, 1656.0, 1654.0, 1654.0, 1652.0, 1651.0, 1650.0, 1650.0, 1650.0, 1650.0, 1650.0, 1650.0, 1649.0, 1647.0, 1644.0, 1644.0, 1644.0, 1644.0, 1643.0, 1642.0, 1642.0, 1640.0, 1640.0, 1638.0, 1637.0, 1636.0, 1636.0, 1635.0, 1635.0, 1635.0, 1635.0, 1634.0, 1630.0, 1628.0, 1627.0, 1625.0, 1624.0, 1621.0, 1618.0, 1617.0, 1615.0, 1615.0, 1614.0, 1612.0, 1609.0, 1608.0, 1608.0, 1608.0, 1601.0, 1600.0, 1592.0, 1591.0, 1586.0, 1584.0, 1582.0, 1580.0, 1577.0, 1577.0, 1575.0, 1575.0, 1572.0, 1572.0, 1567.0, 1567.0, 1566.0, 1566.0, 1564.0, 1564.0, 1564.0, 1564.0, 1564.0, 1563.0, 1556.0, 1553.0, 1552.0, 1550.0, 1550.0, 1550.0, 1546.0, 1544.0, 1542.0, 1529.0, 1528.0, 1527.0, 1526.0, 1522.0, 1520.0, 1519.0, 1518.0, 1518.0, 1517.0, 1517.0, 1516.0, 1513.0, 1511.0, 1511.0, 1510.0, 1510.0, 1510.0, 1508.0, 1505.0, 1505.0, 1505.0, 1503.0, 1503.0, 1500.0, 1498.0, 1498.0, 1498.0, 1496.0, 1495.0, 1495.0, 1495.0, 1494.0, 1490.0, 1490.0, 1490.0, 1490.0, 1489.0, 1486.0, 1485.0, 1485.0, 1485.0, 1485.0, 1482.0, 1481.0, 1481.0, 1480.0, 1480.0, 1476.0, 1475.0, 1470.0, 1465.0, 1465.0, 1464.0, 1460.0, 1460.0, 1460.0, 1460.0, 1460.0, 1453.0, 1452.0, 1452.0, 1451.0, 1450.0, 1447.0, 1429.0, 1427.0, 1342.0, 1336.0, 1332.0, 1325.0, 1325.0, 1315.0, 1312.0, 1306.0, 1304.0, 1304.0, 1297.0, 1290.0];
values = values.filter(val => val >= 1200);
var slider = createD3RangeSlider(1200, 2021, "#container", false, values);
slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
slider.onTouchEnd(function (newRange) {
    d3.select("#range-label").html(newRange.begin + " &mdash; " + newRange.end);
    range = slider.range()
    parameters["creation_year"]["begin"] = range["begin"]
    parameters["creation_year"]["end"] = range["end"]
    parameters["century"] = ''
    console.log(parameters["creation_year"])

    slidder_trigger = true;
    sendWebSocketMessage();
});

function update_options(options) {
    for (const category in options) {

        selector = $('#' + category);
        if (category != 'century') selector.children().not(':first').remove();
        
        if (category == "general_type") {
            selector.append('<br>')
            options[category].forEach(new_option => {
                selector.append(`<input type="radio" id="${new_option}" name="general_type" value="${new_option}">`);
                selector.append(`<label for="${new_option}">${new_option.charAt(0).toUpperCase() + new_option.slice(1)}</label><br>`);
            });

            // Update general type value based on radio selection
            var general_type_radio = document.radioSelect.general_type;
            var prev = null;

            if (typeof general_type_radio != "undefined") {
                for (var i = 0; i < general_type_radio.length; i++) {
                    general_type_radio[i].addEventListener('change', function() {
                        (prev) ? console.log(prev.value) : null;
                        
                        if (this !== prev) {
                            prev = this;
                        }
    
                        parameters["general_type"] = this.value
                        sendWebSocketMessage()
                    });
                }
            }
        } else if (category == "century") {
            // order the centuries
            floatCenturies = options[category].map((value) => parseFloat(value));
            orderedCenturies = dsu(options[category], floatCenturies)
            $('.century-button').removeClass('active');

            orderedCenturies.forEach(new_option => {
                if (new_option != "unknown"){
                    century_selector = `.century-button#${parseInt(new_option)}`
                    $(century_selector).addClass('active')
                }
            })
        } else {
            selector.children().remove();
            if (parameters[category] != '') {
                default_option = $('#' + category + " > .default-option");
                default_option.remove()
            } else {
                switch (category) {
                    case 'artist_nationality':
                        selector.append(`<option class='default-option' value="">-Select a country-</option>`)
                        break;
                    case 'artwork_type':
                        selector.append(`<option class='default-option' value="">-Select an artwork type-</option>`)
                        break;
                    case 'school':
                        selector.append(`<option class='default-option' value="">-Select an artwork school-</option>`)
                        break;
                }
            }

            options[category].forEach(new_option => {
                selector.append(new Option(new_option, new_option));
            });
        }
    };
};