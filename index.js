require('dotenv').config();

const SolisInverterClient = require('./lib/solis_inverter_client.js')
const { name } = require('./package.json')

const DEFAULT_INTERVAL_SECONDS = 30;
const MINIMUM_INTERNAL_SECONDS = 30;

let intervalSeconds = parseInt(process.env.INTERVAL);
if (isNaN(intervalSeconds) || intervalSeconds < MINIMUM_INTERNAL_SECONDS) {
  console.warn(`Interval invalid or less than ${MINIMUM_INTERNAL_SECONDS}s, using default interval of ${DEFAULT_INTERVAL_SECONDS}s (Parsed interval: [${intervalSeconds}])`);
  intervalSeconds = DEFAULT_INTERVAL_SECONDS;
}

const port = 8000
const address = process.env.SOLIS_ADDRESS
const username = process.env.SOLIS_USERNAME
const password = process.env.SOLIS_PASSWORD

if (!address) {
  console.error('address not given')
  process.exit(1)
}

if (!port) {
  console.error('port not given')
  process.exit(1)
}

const inverter = new SolisInverterClient(address, username, password)

/**
 * @type {Object|null}
 */
let lastResponse = null

/**
 * @type {Date|null}
 */
let lastDate = new Date()

/**
 * @param what
 */
 const log = what => console.log([(new Date()).toISOString(), name, what].join(' '))

const server = require('http').createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (lastResponse) {
    if(url.pathname === '/metrics') {
      res.writeHead(200, { 'Last-Modified': lastDate.toString() })
      res.end(`solis_inverter_power_watts ${lastResponse.power}
solis_inverter_yield_today_kwh ${lastResponse.energy.today}
solis_inverter_yield_total_kwh ${lastResponse.energy.total}\
`);
    } else {
      res.writeHead(200, { 'Last-Modified': lastDate.toString() })
      res.end(JSON.stringify(lastResponse))
    }
  } else {
    res.writeHead(500)
    res.end('No data')
  }
})

async function fetchData() {
  try {
    log(`performing http request to solis inverter at ${address}`)
    const data = await inverter.fetchData();
    if (data.inverter.serial) {
      // only store valid responses
      lastResponse = data;
      lastDate.setTime(Date.now());
      log(`last response data updated successfully`)
    } else {
      console.warn('received invalid response from solis inverter', data)
    }
  } catch (err) {
    log(`Could not fetch data from inverter: ${err}`)
  }
}

server.listen(port, async (err) => {
  if (err) {
    log(`unable to listen on port ${port}: ${err}`)
  } else {
    log(`listening on port ${port}`);
    log(`data fetch internal set to ${intervalSeconds}s`)
    await fetchData()
    setInterval(fetchData, intervalSeconds * 1000)
  }
});
