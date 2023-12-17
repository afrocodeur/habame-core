
const ARRAY_OVERRIDABLE_METHODS = [
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'splice'
];

const stateItemMutatorOverride = function($value, $stateItem) {
    if(typeof $value !== 'object') {
        return;
    }
    let mutators = [];

    if(Array.isArray($value)) {
        mutators = ARRAY_OVERRIDABLE_METHODS;
    }
    else {
        mutators = $value.MUTATORS || mutators;
    }

    mutators.forEach((methodName) => {
        const nativeMethod = $value[methodName];
        $value[methodName] = function() {
            const result = nativeMethod.apply($value, Array.from(arguments));
            $stateItem.trigger();
            return result;
        };
    });
};

export default stateItemMutatorOverride;