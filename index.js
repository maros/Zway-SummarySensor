/*** SummarySensor Z-Way HA module *******************************************

Version: 1.0.0
(c) Maroš Kollár, 2015
-----------------------------------------------------------------------------
Author: maros@k-1.com <maros@k-1.com>
Description:
    Create a device that summarises multiple sensors into one virtual device

******************************************************************************/

function SummarySensor (id, controller) {
    // Call superconstructor first (AutomationModule)
    SummarySensor.super_.call(this, id, controller);
}

inherits(SummarySensor, AutomationModule);

_module = SummarySensor;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

SummarySensor.prototype.init = function (config) {
    SummarySensor.super_.prototype.init.call(this, config);
    var self = this;
    
    // Create vdev
    this.vDev = this.controller.devices.create({
        deviceId: "SummarySensor_" + this.id,
        defaults: {
            deviceType: 'sensorMultilevel',
            metrics: {
                level: 0,
                icon: ''
            }
        },
        overlay: {
            deviceType: 'sensorMultilevel',
            scaleTitle: ''
        },
        moduleId: this.id
    });
    
    setTimeout(_.bind(self.initCallback,self),15000);
};

SummarySensor.prototype.initCallback = function() {
    var self = this;
    
    self.callback = _.bind(self.updateSensors,self);
    self.callback();
    
    var firstDevice = self.controller.devices.get(self.config.devices[0]);
    _.each(['icon','scaleTitle','probeTitle'].function(type) {
        self.vDev.set('metrics:'+type,firstDevice.get('metrics:'+type));
    });
    
    _.each(self.config.devices,function(deviceId) {
        var device = self.controller.devices.get(deviceId);
        if (typeof(device) !== 'null') {
            device.on('change:metrics:level',self.callback);
        }
    });
};

SummarySensor.prototype.stop = function() {
    var self = this;
    
    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = null;
    }
    
    _.each(self.config.devices,function(deviceId) {
        var device = self.controller.devices.get(deviceId);
        if (typeof(device) !== 'null') {
            device.off('change:metrics:level',self.callback);
        }
    });
    
    SummarySensor.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

SummarySensor.prototype.updateSensors = function() {
    var self = this;
    
    var values = [];
    
    _.each(self.config.devices,function(deviceId) {
        var device = self.controller.devices.get(deviceId);
        var value = device.get('metrics:level');
        value = parseFloat(value);
        if (_.isNumber(value)) {
            values.push(value);
        }
    });
    
    var summary = 0;
    if (values.length > 0) {
        switch(self.config.summary) {
            case 'average':
                summary = _.reduce(values,function(m,n) {
                    return m + n
                },0);
                summary = summary/values.length;
                break;
            case 'min':
                summary = Math.min.apply(null,values);
                break;
            case 'max':
                summary = Math.max.apply(null,values);
                break;
            case 'count':
                summary = _.reduce(values,function(m,n) {
                    if (n > 0) {
                        m++;
                    }
                    return m;
                },0);
                break;
            case 'sum':
                summary = _.reduce(values,function(m,n) {
                    return m + n;
                },0);
                break;
        }
    }
    self.vDev.set('metrics:level',summary);
    self.vDev.set('metrics:updateTime',summary);
};
 