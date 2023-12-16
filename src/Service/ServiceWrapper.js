import State from "../State/State";

const ServiceWrapper = function($service, isUniqueInstance) {
    let $uniqueInstance = null;

    const getNewInstance = function() {
        const serviceState = new State();
        const instance = new $service(serviceState);
        instance.$serviceState = serviceState;
        return instance;
    };

    this.create = function() {
        if(!isUniqueInstance) {
            return getNewInstance();
        }
        if(!$uniqueInstance) {
            $uniqueInstance = getNewInstance();
        }
        return $uniqueInstance;
    };

    this.definition = function() {
        return $service;
    };
};

export default ServiceWrapper;