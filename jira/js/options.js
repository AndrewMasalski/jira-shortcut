var Options = function() {
    BgConfig.init(function(data) {
        BgConfig.rule.bind()
    });

    $('#test').click(function() {
        BgConfig.rule.test();
    });
    $('#save').click(function() {
        BgConfig.rule.save();
    });
    $('#reset').click(function() {
        BgConfig.rule.reset()
    });
/*
    $('#clear').click(function() {
        BgConfig.rule.clear()
    });
*/

};
document.addEventListener('DOMContentLoaded', function() { new Options() });
