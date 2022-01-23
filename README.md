# Solis inverter JSON API

A simple NodeJS application to read Solis PV inverter data using HTTP interface, extract and serve data as JSON formatted as follows:

```json
{
  "lastSeen": 1582915468053,
  "inverter": {
    "model": "0123",
    "serial": "1234567890ABCDE",
    "firmwareMain": "0123",
    "firmwareSlave": "0122"
  },
  "logger": {
    "serial": "1234567890",
    "version": "MW_08_0501_1.58",
    "mode": "STA",
    "ap": {
      "ssid": "AP_1213456789",
      "ip": "1.1.1.1'",
      "mac": "ABABABABABAB"
    },
    "sta": {
      "ssid": "NETWORK_NAME",
      "ip": "2.2.2.2",
      "mac": "AABBCCDDEEFF",
      "rssi": "99%"
    }
  },
  "remoteServer": {
    "a": true,
    "b": false
  },
  "power": 9999,
  "energy": {
    "today": 15,
    "total": 600
  }
}
```

## Usage:

1. Copy `.env` example file and replace with your values

   ```
   cp .env.example .env
   ```

2. Start application

   ```
   npm start
   ```
