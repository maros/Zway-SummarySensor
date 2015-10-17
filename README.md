# Zway-SummarySensor

Creates a device that summarises multiple sensors into one virtual device. 
Multiple aggregate functions like average, min, max, ... can be used to 
calculate the value.

# Configuration

## devices

List of devices to be summarised. The icon, scaleTitle and probeTitle will be 
taken from the first device in the list.

## summary

Specifies the aggregate function. Available functions are

* average: Average value
* min: Min value
* max: Max value
* count: Count devices with values not equal to zero
* sum: Sum of all values (useful for energy meters)

# Virtual Devices

This module creates a virtual sensorMultilevel device.

# Events

No events are emitted

# License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or any 
later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
