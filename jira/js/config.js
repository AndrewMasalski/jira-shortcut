var RULE_ID = 'jira-shortcut-rule';
var STORAGE = chrome.storage.sync;

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
        BgConfig.rule.load(cb || $.noop);
    },

    force_reload: function() {
        chrome.runtime.getBackgroundPage(function(bg) { bg.init(); });
    },

    match: function(url) {
        return BgConfig.rule.match(url);
    },

    apply: function(url, title) {
        if (BgConfig.rule.match(url)) {
            return BgConfig.rule.apply(title)
        }
        return title;
    }
};

RuleConfig = function() {
    var fields = {};
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
            self.test();
            cb(fields);
        });
    };

    this.save = function() {
        var self = this;
        Storage.save(JSON.stringify(fields), function() {
            self.test();
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
        var res = url.match(new RegExp(fields.url_pattern));
//        console.log('ruleConfig.match:', res);
        return url.match(res);
    };

    this.apply = function(title) {
        var title_pattern = new RegExp(fields.title_pattern);
        var out_pattern = fields.out_pattern;
        return title.replace(title_pattern, out_pattern);
    };

    this.test = function() {
        var result = this.apply(fields.test_title);
        console.log('result:', result);
        $('#result:first').text(result);
    };

};
