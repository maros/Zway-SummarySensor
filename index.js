/*** SummarySensor Z-Way HA module *******************************************

Version: 1.05
(c) Maroš Kollár, 2015
-----------------------------------------------------------------------------
Author: Maroš Kollár <maros@k-1.com>
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

    self.langFile = self.controller.loadModuleLang("SummarySensor");

    // Create vdev
    this.vDev = this.controller.devices.create({
        deviceId: "SummarySensor_" + this.id,
        defaults: {
            deviceType: 'sensorMultilevel',
            metrics: {
                level: 0,
                icon: '',
                title: self.langFile.m_title+' '+self.langFile['summary_'+self.config.summary]
            }
        },
        overlay: {
            deviceType: 'sensorMultilevel'
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
    _.each(['metrics:icon','metrics:scaleTitle','probeType'],function(type) {
        self.vDev.set(type,firstDevice.get(type));
    });

    _.each(self.config.devices,function(deviceId) {
        var deviceObject = self.controller.devices.get(deviceId);
        if (deviceObject === null) {
            console.error('[SummarySensor] Missing device '+deviceId);
        } else {
            deviceObject.on('change:metrics:level',self.callback);
        }
    });
};

SummarySensor.prototype.stop = function() {
    var self = this;

    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }

    _.each(self.config.devices,function(deviceId) {
        var deviceObject = self.controller.devices.get(deviceId);
        if (deviceObject!== null) {
            deviceObject.off('change:metrics:level',self.callback);
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
        var deviceObject = self.controller.devices.get(deviceId);
        if (deviceObject === null) {
            return;
        }
        var value = deviceObject.get('metrics:level');
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
                    return m + n;
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
