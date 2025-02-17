var context = $evaluation.getContext();
var identity = context.getIdentity();
var attributes = identity.getAttributes();

print('Hello2');
print(attributes.exists('company'));

if (attributes.exists('company')) {
    var item = attributes.getValue('company');
    print(item);
    print(!item.isEmpty());
    if(!item.isEmpty()) {
        var value = item.asString(0);
        print(value);
        print(JSON.value(value));
    }
}

$evaluation.grant();