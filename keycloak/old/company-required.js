var context = $evaluation.getContext();
var identity = context.getIdentity();
var attributes = identity.getAttributes();

var attribute = attributes.getValue('company');
if (!attribute.isEmpty()) {
    try {
        var item = JSON.parse(attribute.asString(0));
        if (parseInt(item.id) > 0) {
            $evaluation.grant();
        }
    } catch (error) {}
}