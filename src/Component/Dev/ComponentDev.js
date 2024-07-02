

const ComponentDev = function({ $lifecycle, $event, $componentRequirements , $state }) {

    const $listeners = [];

    /**
     * @param {Function} controller
     */
    this.updateController = function(controller) {
        const stateValues = $state.getAll();
        $lifecycle.clearAll();
        $event.clearAll();
        for(const key in $componentRequirements.Actions) {
            $componentRequirements.Actions[key] = undefined;
        }
        controller($componentRequirements);
        for(const oldStateName in stateValues) {
            if($state.exists(oldStateName)) {
                const value = $state.get(oldStateName).value();
                const oldValue = stateValues[oldStateName];
                if(typeof value !== typeof oldValue) {
                    continue;
                }
                if(Array.isArray(oldValue)) {
                    continue;
                }
                $state.set({ [oldStateName]: stateValues[oldStateName] });
            }
        }
        this.handleListeners();
    };

    this.handleListeners = function() {
        $listeners.forEach((callback) => {
            callback && callback();
        });
    };

    this.onControllerUpdated = function(callback) {
        $listeners.push(callback);
    };

    this.removeControllerUpdatedListener = function(callback) {
        const index = $listeners.findIndex((item) => callback === item);
        $listeners.splice(index, 1);
    };

};

export default ComponentDev;