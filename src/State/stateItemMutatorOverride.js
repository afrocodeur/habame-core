
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
    if(!$value || typeof $value !== 'object' || !$stateItem) {
        return;
    }
    let mutators = [];

    if(Array.isArray($value)) {
        mutators = ARRAY_OVERRIDABLE_METHODS;
    }
    else {
        mutators = $value.MUTATORS || mutators;
    }

    $value.ORIGINAL_METHODS = $value.ORIGINAL_METHODS || {};

    mutators.forEach((methodName) => {
        const nativeMethod = $value.ORIGINAL_METHODS[methodName] || $value[methodName];

        $value[methodName] = function() {
            const result = nativeMethod.apply($value, Array.from(arguments));
            $stateItem.trigger();
            return result;
        };
    });
};

export default stateItemMutatorOverride;