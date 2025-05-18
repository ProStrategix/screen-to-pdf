// insert script: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script> into header

//const send = require('backend/email.web.js')
//import wixData from wix-data
// Optional: You can import backend/send services if needed
// const send = require('backend/email.web.js')
// import wixData from 'wix-data'

// Mock test data import


// DOM elements
let fullName = document.getElementById("name");
let checked = document.getElementById("checked");
let unchecked = document.getElementById("unchecked");
let signature = document.getElementById("signature");
let date = document.getElementById('date');
let favorite = document.getElementById("favorite");
let favoriteWhy = document.getElementById("favoriteWhy");
let least = document.getElementById("least");
let leastWhy = document.getElementById("leastWhy");
let challenge = document.getElementById("challenge");
let challengeWhy = document.getElementById("challengeWhy");
let email = document.getElementById('email');
let phone = document.getElementById("phone");
let street = document.getElementById('street');
let street2 = document.getElementById('street2');
let city = document.getElementById('city');
let state = document.getElementById('state');
let zip = document.getElementById('zip');
let content = document.getElementById('content');
let container = document.getElementById('container');

window.onmessage = async (event) => {
  try {
    let parsedData = JSON.parse(event.data)
    await buildTally(parsed);
    await createImg();
  } catch (err) {
    console.error("Error: " + err + " caused the image to fail to download.");
  }
};

async function testTally() {
    try {
      let result = await Promise.all([fetch('../output.json'), fetch("../log.json"), fetch('../people.json')])
      let tableData = await result[0].json()
      let hikes = await result[1].json()
      let hiker = await result[2].json()

      console.log('this is the table data:', tableData, 'hike data: ', hikes, 'hiker data ', hiker)
      if(!Array.isArray(tableData)) {return console.log('error: result is not an array.')}
      if(!Array.isArray(hiker)) {return console.log('error: result is not an array.')}
      if(!Array.isArray(hikes)) {return console.log('error: result is not an array.')}
      tableData = tableData.sort((a,b) => a.Order - b.Order)
      let appendedTable = await appendData(tableData, hikes)
      let table1 = appendedTable.slice(0,33)
      let table2 = appendedTable.slice(-4)
      console.log('table 1', table1, 'table2', table2, 'hiker', hiker)
      let msg = {
        tableData1: table1,
        table2Data: table2,
        userData: hiker[0],
      }
      console.log('msg: ', msg)
      buildTally(msg)
  } catch (err) {
    console.error("Error: " + err + " caused the image to fail to download.");
  }
}

async function appendData(data, hikes) {
  let result = await new Promise((res,rej) => {
    if(!Array.isArray(data)) {return rej('error: result is not an array.')}
    if(!Array.isArray(hikes)) {return rej('error: result is not an array.')}
    let mtns = hikes.map(x => x.name)
    console.log('mtns', mtns)
    data.forEach((x) => {
    if(mtns.includes(x.Title)) {
      let index = hikes.findIndex(y => x.Title === y.name)
      console.log('found match for', x.Title)
      console.log('index', index)
      x.Notes = hikes[index].notes
      x.Date = hikes[index].date
    } else {
      console.log('no match found for', x.Title)
    }
  })
    res(data)
  })
  console.log('result', result)

  return result
}

async function createImg() {
  try {
    const canvas = await html2canvas(content, {
      scale: window.devicePixelRatio || 1,
      useCORS: true
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'converted-html-image.png';
    link.click();
  } catch (err) {
    console.error("html2canvas error:", err);
  }
}

function addUserInput(data) {
  fullName.innerText = data.nickname || data.fullName;
  checked.style.display = data.checked ? "inline" : "none";
  unchecked.style.display = data.unchecked ? "inline" : "none";
  signature.src = data.signature;

  date.innerText = new Date(data.lastUpdated).toLocaleDateString();
  favorite.innerText = data.favorite;
  least.innerText = data.least;
  challenge.innerText = data.challenge;
  favoriteWhy.innerText = data.favoriteWhy;
  leastWhy.innerText = data.leastWhy;
  challengeWhy.innerText = data.challengeWhy;
  email.innerText = data.loginEmail;
  phone.innerText = `(${data.phone.slice(0, 3)}) ${data.phone.slice(3, 6)}-${data.phone.slice(6)}`;
  street.innerText = data.streetAddress;
  if (data.street2 && data.street2.trim()) {
    street2.innerText = data.street2;
  } else {
    street2.style.display = "none";
  }
  city.innerText = data.city;
  state.innerText = data.state;
  zip.innerText = data.zip;
}

function createTable(data, color, bcolor, thColor) {
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  table.style.width = '100%';
  bcolor === "" ? table.style.backgroundColor = "white" : table.style.backgroundColor = bcolor
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const width = ["150px", "100px", "100px","100px","3fr" ];
  ['Mountain', 'Elevation', 'Date', 'Order', 'Notes'].forEach((text, i) => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.border = '1px solid #000';
    th.style.padding = '8px';
    th.style.width = width[i]
    th.style.color = color
    if(i>0 && i<4) {th.style.text = "center"} else {
      th.style.textAlign = "left"
    }
    bcolor === "" ? th.style.backgroundColor = "white" : th.style.backgroundColor = bcolor;
    if(thColor !== "") {th.style.backgroundColor = thColor}
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.sort((a, b) => a.Order - b.Order)
  data.forEach(rowData => {
    const row = document.createElement('tr');
    ['Title', 'Elevation', 'Date', 'Order', 'Notes'].forEach((key, i) => {
      const td = document.createElement('td');
      td.textContent = rowData[key] || '';
      td.style.border = '1px solid #000';
      td.style.padding = '8px';
      if(["Elevation", "Date", "Order"].includes(key)) {td.style.textAlign = "center"} else {
      td.style.textAlign = "left"
    }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
}

async function buildTally(msg) {
  try {
    // Clear container first
    container.innerHTML = '';
    let reorder = msg.table2Data.map(x => {
      let temp = x.Order
      temp -= 33
      console.log(temp)
      x.Order = temp
      console.log(x)
      return x
    })

    console.log(reorder)

    const table1 = createTable(msg.tableData1, "black", "","#C6FDC4");
    const table2 = createTable(reorder, "#1D67CD", "#F4FDFF");

    // Append table1 or fallback
    if (table1) {
      container.appendChild(table1);
    } else {
      const missing = document.createElement("h2");
      missing.innerText = "Missing Hike Data";
      container.appendChild(missing);
    }

    // Header for winter peaks
    const winterHeader = document.createElement("p");
    winterHeader.className = "Subheader";
    winterHeader.innerText = "Winter Peaks: These four peaks must each be climbed twice, at least once in winter (Dec 21 - Mar 21)";
    winterHeader.classList.add("winter");
    container.appendChild(winterHeader);

    // Append table2 or fallback
    if (table2) {
      container.appendChild(table2);
    } else {
      const missing = document.createElement("h2");
      missing.innerText = "Missing Hike Data";
      container.appendChild(missing);
    }

    addUserInput(msg.userData);
  } catch (err) {
    console.error("buildTally error:", err);
  }
}

testTally()