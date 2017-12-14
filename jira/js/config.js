var RULE_ID = 'jira-shortcut-rule';
var STORAGE = chrome.storage.local;

Storage = {
    get: function(cb) {
        STORAGE.get(RULE_ID, function(data) {
            console.log('storage.get:', data);
            cb(data['jira-shortcut-rule']);
        });
    },
    save: function(value, cb) {
        var data = {};
        data[RULE_ID] = value;
        STORAGE.set(data, function() {
            console.log('storage.set:', data);
            cb(data);
        });
    },
    clear: function(cb) {
        cb = cb || $.noop;
        STORAGE.clear(function() {
            console.log('storage.clear');
            cb();
        });
    }
};

BgConfig = {
    rule: {},
    init: function(cb) {
        BgConfig.rule = new RuleConfig();
        BgConfig.rule.load(cb);
    },

    force_reload: function() {
        chrome.runtime.getBackgroundPage(function(bg) { bg.init(); });
    },

    match: function(url) {
        return !!BgConfig.rule.match(url);
    },

    apply: function(url, title) {
        var result = [];
        if (BgConfig.rule.match(url)) {
            result.push(BgConfig.rule.apply(url, title))
        }
        return result;
    }
};

RuleConfig = function() {
    var fields = {};
    var result = '[HDP-3629] Document the metrics';
    var defaults = {
        test_url: 'https://issues.apache.org/jira/browse/HADOOP-3629',
        test_title: '[HDP-3629] Document the metrics - Project Management - JIRA',
        url_pattern: 'jira/browse/',
        title_pattern: '^\\[([^\\]]+)\\](.*)( -.*)( -.*)$',
        out_pattern: '[$1]$2'
    };

    this.load = function(cb) {
        var self = this;
        Storage.get(function(data) {
            if (!data) {
                console.log('loading defaults:', data);
                data = JSON.stringify(defaults);
            }
            fields = JSON.parse(data);
            self.apply();
            cb(fields);
        });
    };

    this.save = function() {
        var self = this;
        Storage.save(JSON.stringify(fields), function() {
            self.apply();
            BgConfig.force_reload();
        });
    };

    this.bind = function() {
        rivets.bind($('#rule_template'), fields);
    };

    this.reset = function() {
        fields = defaults;
        rivets.bind($('#rule_template'), fields);
    };

    this.clear = function() {
        Storage.clear()
    };

    this.match = function(url) {
        console.log('ruleConfig.match:',url);
        return url.match(new RegExp(fields.url_pattern));
    };

    this.apply = function() {
        var title_pattern = new RegExp(fields.title_pattern);
        var out_pattern = fields.out_pattern;
        result = fields.test_title.replace(title_pattern, out_pattern);
        console.log('result:', result);
        $('#result:first').text(result);
    };

};
