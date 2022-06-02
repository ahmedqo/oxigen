var jsonic = function(src) {
    if (Object.prototype.toString.call(src) !== '[object String]') {
        if (!Object.prototype.toString.call(src).match(/\[object (Object|Array)\]/)) {
            //throw new Error( "Not an object, array or string: "+src )
            return '' + src;
        } else return src;
    }

    src = src.trim();

    if ('{' != src[0] && '[' != src[0]) {
        src = '{' + src + '}';
    }

    return jsonic_parser.parse(src);
}

var jsonic_parser = (function() {

    function oxi_subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
    }

    function SyntaxError(message, expected, found, offset, line, column) {
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.offset = offset;
        this.line = line;
        this.column = column;

        this.name = "SyntaxError";
    }

    oxi_subclass(SyntaxError, Error);

    function parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {},

            oxi_FAILED = {},

            oxi_startRuleFunctions = { start: oxi_parsestart },
            oxi_startRuleFunction = oxi_parsestart,

            oxi_c0 = oxi_FAILED,
            oxi_c1 = function(object) { return object; },
            oxi_c2 = function(array) { return array; },
            oxi_c3 = "{",
            oxi_c4 = { type: "literal", value: "{", description: "\"{\"" },
            oxi_c5 = "}",
            oxi_c6 = { type: "literal", value: "}", description: "\"}\"" },
            oxi_c7 = function() { return {}; },
            oxi_c8 = function(members) { return members; },
            oxi_c9 = null,
            oxi_c10 = ",",
            oxi_c11 = { type: "literal", value: ",", description: "\",\"" },
            oxi_c12 = [],
            oxi_c13 = function(head, tail) {
                var result = {};
                if (head) { result[head[0]] = fixNull(head[1]); }
                for (var i = 0; i < tail.length; i++) {
                    result[tail[i][2][0]] = fixNull(tail[i][2][1]);
                }
                return result;
            },
            oxi_c14 = ":",
            oxi_c15 = { type: "literal", value: ":", description: "\":\"" },
            oxi_c16 = function(name, value) { return [name, value]; },
            oxi_c17 = "[",
            oxi_c18 = { type: "literal", value: "[", description: "\"[\"" },
            oxi_c19 = "]",
            oxi_c20 = { type: "literal", value: "]", description: "\"]\"" },
            oxi_c21 = function() { return []; },
            oxi_c22 = function(elements) { return elements; },
            oxi_c23 = function(head, tail) {
                var result = [];
                if (typeof head !== 'undefined' && head !== null) { result.push(fixNull(head)) }
                for (var i = 0; i < tail.length; i++) {
                    result.push(fixNull(tail[i][2]));
                }
                return result;
            },
            oxi_c24 = "true",
            oxi_c25 = { type: "literal", value: "true", description: "\"true\"" },
            oxi_c26 = function() { return true; },
            oxi_c27 = "false",
            oxi_c28 = { type: "literal", value: "false", description: "\"false\"" },
            oxi_c29 = function() { return false; },
            oxi_c30 = "null",
            oxi_c31 = { type: "literal", value: "null", description: "\"null\"" },
            oxi_c32 = function() { return null_; },
            oxi_c33 = function(lit) { return lit.join('').trim() },
            oxi_c34 = { type: "other", description: "double-quote string" },
            oxi_c35 = "\"",
            oxi_c36 = { type: "literal", value: "\"", description: "\"\\\"\"" },
            oxi_c37 = function() { return ""; },
            oxi_c38 = function(chars) { return chars; },
            oxi_c39 = { type: "other", description: "single-quote string" },
            oxi_c40 = "'",
            oxi_c41 = { type: "literal", value: "'", description: "\"'\"" },
            oxi_c42 = function(chars) { return chars.join(""); },
            oxi_c43 = /^[^"\\\0-\x1F]/,
            oxi_c44 = { type: "class", value: "[^\"\\\\\\0-\\x1F]", description: "[^\"\\\\\\0-\\x1F]" },
            oxi_c45 = "\\\"",
            oxi_c46 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
            oxi_c47 = function() { return '"'; },
            oxi_c48 = "\\\\",
            oxi_c49 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
            oxi_c50 = function() { return "\\"; },
            oxi_c51 = "\\/",
            oxi_c52 = { type: "literal", value: "\\/", description: "\"\\\\/\"" },
            oxi_c53 = function() { return "/"; },
            oxi_c54 = "\\b",
            oxi_c55 = { type: "literal", value: "\\b", description: "\"\\\\b\"" },
            oxi_c56 = function() { return "\b"; },
            oxi_c57 = "\\f",
            oxi_c58 = { type: "literal", value: "\\f", description: "\"\\\\f\"" },
            oxi_c59 = function() { return "\f"; },
            oxi_c60 = "\\n",
            oxi_c61 = { type: "literal", value: "\\n", description: "\"\\\\n\"" },
            oxi_c62 = function() { return "\n"; },
            oxi_c63 = "\\r",
            oxi_c64 = { type: "literal", value: "\\r", description: "\"\\\\r\"" },
            oxi_c65 = function() { return "\r"; },
            oxi_c66 = "\\t",
            oxi_c67 = { type: "literal", value: "\\t", description: "\"\\\\t\"" },
            oxi_c68 = function() { return "\t"; },
            oxi_c69 = "\\u",
            oxi_c70 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
            oxi_c71 = function(h1, h2, h3, h4) {
                return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
            },
            oxi_c72 = /^[^'\\\0-\x1F]/,
            oxi_c73 = { type: "class", value: "[^'\\\\\\0-\\x1F]", description: "[^'\\\\\\0-\\x1F]" },
            oxi_c74 = "\\'",
            oxi_c75 = { type: "literal", value: "\\'", description: "\"\\\\'\"" },
            oxi_c76 = function() { return '\''; },
            oxi_c77 = { type: "other", description: "key" },
            oxi_c78 = /^[a-zA-Z0-9_$\-]/,
            oxi_c79 = { type: "class", value: "[a-zA-Z0-9_$\\-]", description: "[a-zA-Z0-9_$\\-]" },
            oxi_c80 = function(chars) { return chars.join('') },
            oxi_c81 = /^[^,}\]]/,
            oxi_c82 = { type: "class", value: "[^,}\\]]", description: "[^,}\\]]" },
            oxi_c83 = { type: "other", description: "number" },
            oxi_c84 = function(int_, frac, exp, suffix) { return 0 === suffix.length ? parseFloat(int_ + frac + exp) : (int_ + frac + exp + suffix.join('')).trim(); },
            oxi_c85 = function(int_, frac, suffix) { return 0 === suffix.length ? parseFloat(int_ + frac) : (int_ + frac + suffix.join('')).trim(); },
            oxi_c86 = function(int_, exp, suffix) { return 0 === suffix.length ? parseFloat(int_ + exp) : (int_ + exp + suffix.join('')).trim(); },
            oxi_c87 = function(int_, suffix) { return 0 === suffix.length ? parseFloat(int_) : (int_ + suffix.join('')).trim(); },
            oxi_c88 = function(digit19, digits) { return digit19 + digits; },
            oxi_c89 = "-",
            oxi_c90 = { type: "literal", value: "-", description: "\"-\"" },
            oxi_c91 = function(digit19, digits) { return "-" + digit19 + digits; },
            oxi_c92 = function(digit) { return "-" + digit; },
            oxi_c93 = ".",
            oxi_c94 = { type: "literal", value: ".", description: "\".\"" },
            oxi_c95 = function(digits) { return "." + digits; },
            oxi_c96 = function(e, digits) { return e + digits; },
            oxi_c97 = function(digits) { return digits.join(""); },
            oxi_c98 = /^[eE]/,
            oxi_c99 = { type: "class", value: "[eE]", description: "[eE]" },
            oxi_c100 = /^[+\-]/,
            oxi_c101 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
            oxi_c102 = function(e, sign) { return e + (sign ? sign : ''); },
            oxi_c103 = /^[0-9]/,
            oxi_c104 = { type: "class", value: "[0-9]", description: "[0-9]" },
            oxi_c105 = /^[1-9]/,
            oxi_c106 = { type: "class", value: "[1-9]", description: "[1-9]" },
            oxi_c107 = /^[0-9a-fA-F]/,
            oxi_c108 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
            oxi_c109 = { type: "other", description: "whitespace" },
            oxi_c110 = /^[ \t\n\r]/,
            oxi_c111 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

            oxi_currPos = 0,
            oxi_reportedPos = 0,
            oxi_cachedPos = 0,
            oxi_cachedPosDetails = { line: 1, column: 1, seenCR: false },
            oxi_maxFailPos = 0,
            oxi_maxFailExpected = [],
            oxi_silentFails = 0,

            oxi_result;

        if ("startRule" in options) {
            if (!(options.startRule in oxi_startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }

            oxi_startRuleFunction = oxi_startRuleFunctions[options.startRule];
        }

        function oxi_computePosDetails(pos) {
            function advance(details, startPos, endPos) {
                var p, ch;

                for (p = startPos; p < endPos; p++) {
                    ch = input.charAt(p);
                    if (ch === "\n") {
                        if (!details.seenCR) { details.line++; }
                        details.column = 1;
                        details.seenCR = false;
                    } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                        details.line++;
                        details.column = 1;
                        details.seenCR = true;
                    } else {
                        details.column++;
                        details.seenCR = false;
                    }
                }
            }

            if (oxi_cachedPos !== pos) {
                if (oxi_cachedPos > pos) {
                    oxi_cachedPos = 0;
                    oxi_cachedPosDetails = { line: 1, column: 1, seenCR: false };
                }
                advance(oxi_cachedPosDetails, oxi_cachedPos, pos);
                oxi_cachedPos = pos;
            }

            return oxi_cachedPosDetails;
        }

        function oxi_fail(expected) {
            if (oxi_currPos < oxi_maxFailPos) { return; }

            if (oxi_currPos > oxi_maxFailPos) {
                oxi_maxFailPos = oxi_currPos;
                oxi_maxFailExpected = [];
            }

            oxi_maxFailExpected.push(expected);
        }

        function oxi_buildException(message, expected, pos) {
            function cleanupExpected(expected) {
                var i = 1;

                expected.sort(function(a, b) {
                    if (a.description < b.description) {
                        return -1;
                    } else if (a.description > b.description) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                while (i < expected.length) {
                    if (expected[i - 1] === expected[i]) {
                        expected.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }

            function buildMessage(expected, found) {
                function stringEscape(s) {
                    function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

                    return s
                        .replace(/\\/g, '\\\\')
                        .replace(/"/g, '\\"')
                        .replace(/\x08/g, '\\b')
                        .replace(/\t/g, '\\t')
                        .replace(/\n/g, '\\n')
                        .replace(/\f/g, '\\f')
                        .replace(/\r/g, '\\r')
                        .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
                        .replace(/[\x10-\x1F\x80-\xFF]/g, function(ch) { return '\\x' + hex(ch); })
                        .replace(/[\u0180-\u0FFF]/g, function(ch) { return '\\u0' + hex(ch); })
                        .replace(/[\u1080-\uFFFF]/g, function(ch) { return '\\u' + hex(ch); });
                }

                var expectedDescs = new Array(expected.length),
                    expectedDesc, foundDesc, i;

                for (i = 0; i < expected.length; i++) {
                    expectedDescs[i] = expected[i].description;
                }

                expectedDesc = expected.length > 1 ?
                    expectedDescs.slice(0, -1).join(", ") +
                    " or " +
                    expectedDescs[expected.length - 1] :
                    expectedDescs[0];

                foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

                return "Expected " + expectedDesc + " but " + foundDesc + " found.";
            }

            var posDetails = oxi_computePosDetails(pos),
                found = pos < input.length ? input.charAt(pos) : null;

            if (expected !== null) {
                cleanupExpected(expected);
            }

            return new SyntaxError(
                message !== null ? message : buildMessage(expected, found),
                expected,
                found,
                pos,
                posDetails.line,
                posDetails.column
            );
        }

        function oxi_parsestart() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            s1 = oxi_parse_();
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parseobject();
                if (s2 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c1(s2);
                    s0 = s1;
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                s1 = oxi_parse_();
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parsearray();
                    if (s2 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c2(s2);
                        s0 = s1;
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            }

            return s0;
        }

        function oxi_parseobject() {
            var s0, s1, s2, s3, s4, s5;

            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 123) {
                s1 = oxi_c3;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c4); }
            }
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parse_();
                if (s2 !== oxi_FAILED) {
                    if (input.charCodeAt(oxi_currPos) === 125) {
                        s3 = oxi_c5;
                        oxi_currPos++;
                    } else {
                        s3 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c6); }
                    }
                    if (s3 !== oxi_FAILED) {
                        s4 = oxi_parse_();
                        if (s4 !== oxi_FAILED) {
                            oxi_reportedPos = s0;
                            s1 = oxi_c7();
                            s0 = s1;
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.charCodeAt(oxi_currPos) === 123) {
                    s1 = oxi_c3;
                    oxi_currPos++;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c4); }
                }
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parse_();
                    if (s2 !== oxi_FAILED) {
                        s3 = oxi_parsemembers();
                        if (s3 !== oxi_FAILED) {
                            if (input.charCodeAt(oxi_currPos) === 125) {
                                s4 = oxi_c5;
                                oxi_currPos++;
                            } else {
                                s4 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c6); }
                            }
                            if (s4 !== oxi_FAILED) {
                                s5 = oxi_parse_();
                                if (s5 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c8(s3);
                                    s0 = s1;
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            }

            return s0;
        }

        function oxi_parsemembers() {
            var s0, s1, s2, s3, s4, s5, s6, s7;

            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 44) {
                s1 = oxi_c10;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
            }
            if (s1 === oxi_FAILED) {
                s1 = oxi_c9;
            }
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsepair();
                if (s2 === oxi_FAILED) {
                    s2 = oxi_c9;
                }
                if (s2 !== oxi_FAILED) {
                    s3 = [];
                    s4 = oxi_currPos;
                    if (input.charCodeAt(oxi_currPos) === 44) {
                        s5 = oxi_c10;
                        oxi_currPos++;
                    } else {
                        s5 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                    }
                    if (s5 !== oxi_FAILED) {
                        s6 = oxi_parse_();
                        if (s6 !== oxi_FAILED) {
                            s7 = oxi_parsepair();
                            if (s7 !== oxi_FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            } else {
                                oxi_currPos = s4;
                                s4 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s4;
                            s4 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s4;
                        s4 = oxi_c0;
                    }
                    while (s4 !== oxi_FAILED) {
                        s3.push(s4);
                        s4 = oxi_currPos;
                        if (input.charCodeAt(oxi_currPos) === 44) {
                            s5 = oxi_c10;
                            oxi_currPos++;
                        } else {
                            s5 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                        }
                        if (s5 !== oxi_FAILED) {
                            s6 = oxi_parse_();
                            if (s6 !== oxi_FAILED) {
                                s7 = oxi_parsepair();
                                if (s7 !== oxi_FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                } else {
                                    oxi_currPos = s4;
                                    s4 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s4;
                                s4 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s4;
                            s4 = oxi_c0;
                        }
                    }
                    if (s3 !== oxi_FAILED) {
                        if (input.charCodeAt(oxi_currPos) === 44) {
                            s4 = oxi_c10;
                            oxi_currPos++;
                        } else {
                            s4 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                        }
                        if (s4 === oxi_FAILED) {
                            s4 = oxi_c9;
                        }
                        if (s4 !== oxi_FAILED) {
                            s5 = oxi_parse_();
                            if (s5 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c13(s2, s3);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parsepair() {
            var s0, s1, s2, s3, s4, s5;

            s0 = oxi_currPos;
            s1 = oxi_parsekey();
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parse_();
                if (s2 !== oxi_FAILED) {
                    if (input.charCodeAt(oxi_currPos) === 58) {
                        s3 = oxi_c14;
                        oxi_currPos++;
                    } else {
                        s3 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c15); }
                    }
                    if (s3 !== oxi_FAILED) {
                        s4 = oxi_parse_();
                        if (s4 !== oxi_FAILED) {
                            s5 = oxi_parsevalue();
                            if (s5 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c16(s1, s5);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parsearray() {
            var s0, s1, s2, s3, s4, s5;

            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 91) {
                s1 = oxi_c17;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c18); }
            }
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parse_();
                if (s2 !== oxi_FAILED) {
                    if (input.charCodeAt(oxi_currPos) === 93) {
                        s3 = oxi_c19;
                        oxi_currPos++;
                    } else {
                        s3 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c20); }
                    }
                    if (s3 !== oxi_FAILED) {
                        s4 = oxi_parse_();
                        if (s4 !== oxi_FAILED) {
                            oxi_reportedPos = s0;
                            s1 = oxi_c21();
                            s0 = s1;
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.charCodeAt(oxi_currPos) === 91) {
                    s1 = oxi_c17;
                    oxi_currPos++;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c18); }
                }
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parse_();
                    if (s2 !== oxi_FAILED) {
                        s3 = oxi_parseelements();
                        if (s3 !== oxi_FAILED) {
                            if (input.charCodeAt(oxi_currPos) === 93) {
                                s4 = oxi_c19;
                                oxi_currPos++;
                            } else {
                                s4 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c20); }
                            }
                            if (s4 !== oxi_FAILED) {
                                s5 = oxi_parse_();
                                if (s5 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c22(s3);
                                    s0 = s1;
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            }

            return s0;
        }

        function oxi_parseelements() {
            var s0, s1, s2, s3, s4, s5, s6, s7;

            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 44) {
                s1 = oxi_c10;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
            }
            if (s1 === oxi_FAILED) {
                s1 = oxi_c9;
            }
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsevalue();
                if (s2 === oxi_FAILED) {
                    s2 = oxi_c9;
                }
                if (s2 !== oxi_FAILED) {
                    s3 = [];
                    s4 = oxi_currPos;
                    if (input.charCodeAt(oxi_currPos) === 44) {
                        s5 = oxi_c10;
                        oxi_currPos++;
                    } else {
                        s5 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                    }
                    if (s5 !== oxi_FAILED) {
                        s6 = oxi_parse_();
                        if (s6 !== oxi_FAILED) {
                            s7 = oxi_parsevalue();
                            if (s7 !== oxi_FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            } else {
                                oxi_currPos = s4;
                                s4 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s4;
                            s4 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s4;
                        s4 = oxi_c0;
                    }
                    while (s4 !== oxi_FAILED) {
                        s3.push(s4);
                        s4 = oxi_currPos;
                        if (input.charCodeAt(oxi_currPos) === 44) {
                            s5 = oxi_c10;
                            oxi_currPos++;
                        } else {
                            s5 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                        }
                        if (s5 !== oxi_FAILED) {
                            s6 = oxi_parse_();
                            if (s6 !== oxi_FAILED) {
                                s7 = oxi_parsevalue();
                                if (s7 !== oxi_FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                } else {
                                    oxi_currPos = s4;
                                    s4 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s4;
                                s4 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s4;
                            s4 = oxi_c0;
                        }
                    }
                    if (s3 !== oxi_FAILED) {
                        if (input.charCodeAt(oxi_currPos) === 44) {
                            s4 = oxi_c10;
                            oxi_currPos++;
                        } else {
                            s4 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c11); }
                        }
                        if (s4 === oxi_FAILED) {
                            s4 = oxi_c9;
                        }
                        if (s4 !== oxi_FAILED) {
                            s5 = oxi_parse_();
                            if (s5 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c23(s2, s3);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parsevalue() {
            var s0, s1, s2;

            s0 = oxi_parsestring();
            if (s0 === oxi_FAILED) {
                s0 = oxi_parsesingle();
                if (s0 === oxi_FAILED) {
                    s0 = oxi_parseobject();
                    if (s0 === oxi_FAILED) {
                        s0 = oxi_parsearray();
                        if (s0 === oxi_FAILED) {
                            s0 = oxi_currPos;
                            if (input.substr(oxi_currPos, 4) === oxi_c24) {
                                s1 = oxi_c24;
                                oxi_currPos += 4;
                            } else {
                                s1 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c25); }
                            }
                            if (s1 !== oxi_FAILED) {
                                s2 = oxi_parse_();
                                if (s2 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c26();
                                    s0 = s1;
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                            if (s0 === oxi_FAILED) {
                                s0 = oxi_currPos;
                                if (input.substr(oxi_currPos, 5) === oxi_c27) {
                                    s1 = oxi_c27;
                                    oxi_currPos += 5;
                                } else {
                                    s1 = oxi_FAILED;
                                    if (oxi_silentFails === 0) { oxi_fail(oxi_c28); }
                                }
                                if (s1 !== oxi_FAILED) {
                                    s2 = oxi_parse_();
                                    if (s2 !== oxi_FAILED) {
                                        oxi_reportedPos = s0;
                                        s1 = oxi_c29();
                                        s0 = s1;
                                    } else {
                                        oxi_currPos = s0;
                                        s0 = oxi_c0;
                                    }
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                                if (s0 === oxi_FAILED) {
                                    s0 = oxi_currPos;
                                    if (input.substr(oxi_currPos, 4) === oxi_c30) {
                                        s1 = oxi_c30;
                                        oxi_currPos += 4;
                                    } else {
                                        s1 = oxi_FAILED;
                                        if (oxi_silentFails === 0) { oxi_fail(oxi_c31); }
                                    }
                                    if (s1 !== oxi_FAILED) {
                                        s2 = oxi_parse_();
                                        if (s2 !== oxi_FAILED) {
                                            oxi_reportedPos = s0;
                                            s1 = oxi_c32();
                                            s0 = s1;
                                        } else {
                                            oxi_currPos = s0;
                                            s0 = oxi_c0;
                                        }
                                    } else {
                                        oxi_currPos = s0;
                                        s0 = oxi_c0;
                                    }
                                    if (s0 === oxi_FAILED) {
                                        s0 = oxi_parsenumber();
                                        if (s0 === oxi_FAILED) {
                                            s0 = oxi_currPos;
                                            s1 = oxi_parseliteral();
                                            if (s1 !== oxi_FAILED) {
                                                oxi_reportedPos = s0;
                                                s1 = oxi_c33(s1);
                                            }
                                            s0 = s1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return s0;
        }

        function oxi_parsestring() {
            var s0, s1, s2, s3, s4;

            oxi_silentFails++;
            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 34) {
                s1 = oxi_c35;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c36); }
            }
            if (s1 !== oxi_FAILED) {
                if (input.charCodeAt(oxi_currPos) === 34) {
                    s2 = oxi_c35;
                    oxi_currPos++;
                } else {
                    s2 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c36); }
                }
                if (s2 !== oxi_FAILED) {
                    s3 = oxi_parse_();
                    if (s3 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c37();
                        s0 = s1;
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.charCodeAt(oxi_currPos) === 34) {
                    s1 = oxi_c35;
                    oxi_currPos++;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c36); }
                }
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parsechars();
                    if (s2 !== oxi_FAILED) {
                        if (input.charCodeAt(oxi_currPos) === 34) {
                            s3 = oxi_c35;
                            oxi_currPos++;
                        } else {
                            s3 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c36); }
                        }
                        if (s3 !== oxi_FAILED) {
                            s4 = oxi_parse_();
                            if (s4 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c38(s2);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            }
            oxi_silentFails--;
            if (s0 === oxi_FAILED) {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c34); }
            }

            return s0;
        }

        function oxi_parsesingle() {
            var s0, s1, s2, s3, s4;

            oxi_silentFails++;
            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 39) {
                s1 = oxi_c40;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c41); }
            }
            if (s1 !== oxi_FAILED) {
                if (input.charCodeAt(oxi_currPos) === 39) {
                    s2 = oxi_c40;
                    oxi_currPos++;
                } else {
                    s2 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c41); }
                }
                if (s2 !== oxi_FAILED) {
                    s3 = oxi_parse_();
                    if (s3 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c37();
                        s0 = s1;
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.charCodeAt(oxi_currPos) === 39) {
                    s1 = oxi_c40;
                    oxi_currPos++;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c41); }
                }
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parseschars();
                    if (s2 !== oxi_FAILED) {
                        if (input.charCodeAt(oxi_currPos) === 39) {
                            s3 = oxi_c40;
                            oxi_currPos++;
                        } else {
                            s3 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c41); }
                        }
                        if (s3 !== oxi_FAILED) {
                            s4 = oxi_parse_();
                            if (s4 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c38(s2);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            }
            oxi_silentFails--;
            if (s0 === oxi_FAILED) {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c39); }
            }

            return s0;
        }

        function oxi_parsechars() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            s1 = [];
            s2 = oxi_parsechar();
            if (s2 !== oxi_FAILED) {
                while (s2 !== oxi_FAILED) {
                    s1.push(s2);
                    s2 = oxi_parsechar();
                }
            } else {
                s1 = oxi_c0;
            }
            if (s1 !== oxi_FAILED) {
                oxi_reportedPos = s0;
                s1 = oxi_c42(s1);
            }
            s0 = s1;

            return s0;
        }

        function oxi_parsechar() {
            var s0, s1, s2, s3, s4, s5;

            if (oxi_c43.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c44); }
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.substr(oxi_currPos, 2) === oxi_c45) {
                    s1 = oxi_c45;
                    oxi_currPos += 2;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c46); }
                }
                if (s1 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c47();
                }
                s0 = s1;
                if (s0 === oxi_FAILED) {
                    s0 = oxi_currPos;
                    if (input.substr(oxi_currPos, 2) === oxi_c48) {
                        s1 = oxi_c48;
                        oxi_currPos += 2;
                    } else {
                        s1 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c49); }
                    }
                    if (s1 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c50();
                    }
                    s0 = s1;
                    if (s0 === oxi_FAILED) {
                        s0 = oxi_currPos;
                        if (input.substr(oxi_currPos, 2) === oxi_c51) {
                            s1 = oxi_c51;
                            oxi_currPos += 2;
                        } else {
                            s1 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c52); }
                        }
                        if (s1 !== oxi_FAILED) {
                            oxi_reportedPos = s0;
                            s1 = oxi_c53();
                        }
                        s0 = s1;
                        if (s0 === oxi_FAILED) {
                            s0 = oxi_currPos;
                            if (input.substr(oxi_currPos, 2) === oxi_c54) {
                                s1 = oxi_c54;
                                oxi_currPos += 2;
                            } else {
                                s1 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c55); }
                            }
                            if (s1 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c56();
                            }
                            s0 = s1;
                            if (s0 === oxi_FAILED) {
                                s0 = oxi_currPos;
                                if (input.substr(oxi_currPos, 2) === oxi_c57) {
                                    s1 = oxi_c57;
                                    oxi_currPos += 2;
                                } else {
                                    s1 = oxi_FAILED;
                                    if (oxi_silentFails === 0) { oxi_fail(oxi_c58); }
                                }
                                if (s1 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c59();
                                }
                                s0 = s1;
                                if (s0 === oxi_FAILED) {
                                    s0 = oxi_currPos;
                                    if (input.substr(oxi_currPos, 2) === oxi_c60) {
                                        s1 = oxi_c60;
                                        oxi_currPos += 2;
                                    } else {
                                        s1 = oxi_FAILED;
                                        if (oxi_silentFails === 0) { oxi_fail(oxi_c61); }
                                    }
                                    if (s1 !== oxi_FAILED) {
                                        oxi_reportedPos = s0;
                                        s1 = oxi_c62();
                                    }
                                    s0 = s1;
                                    if (s0 === oxi_FAILED) {
                                        s0 = oxi_currPos;
                                        if (input.substr(oxi_currPos, 2) === oxi_c63) {
                                            s1 = oxi_c63;
                                            oxi_currPos += 2;
                                        } else {
                                            s1 = oxi_FAILED;
                                            if (oxi_silentFails === 0) { oxi_fail(oxi_c64); }
                                        }
                                        if (s1 !== oxi_FAILED) {
                                            oxi_reportedPos = s0;
                                            s1 = oxi_c65();
                                        }
                                        s0 = s1;
                                        if (s0 === oxi_FAILED) {
                                            s0 = oxi_currPos;
                                            if (input.substr(oxi_currPos, 2) === oxi_c66) {
                                                s1 = oxi_c66;
                                                oxi_currPos += 2;
                                            } else {
                                                s1 = oxi_FAILED;
                                                if (oxi_silentFails === 0) { oxi_fail(oxi_c67); }
                                            }
                                            if (s1 !== oxi_FAILED) {
                                                oxi_reportedPos = s0;
                                                s1 = oxi_c68();
                                            }
                                            s0 = s1;
                                            if (s0 === oxi_FAILED) {
                                                s0 = oxi_currPos;
                                                if (input.substr(oxi_currPos, 2) === oxi_c69) {
                                                    s1 = oxi_c69;
                                                    oxi_currPos += 2;
                                                } else {
                                                    s1 = oxi_FAILED;
                                                    if (oxi_silentFails === 0) { oxi_fail(oxi_c70); }
                                                }
                                                if (s1 !== oxi_FAILED) {
                                                    s2 = oxi_parsehexDigit();
                                                    if (s2 !== oxi_FAILED) {
                                                        s3 = oxi_parsehexDigit();
                                                        if (s3 !== oxi_FAILED) {
                                                            s4 = oxi_parsehexDigit();
                                                            if (s4 !== oxi_FAILED) {
                                                                s5 = oxi_parsehexDigit();
                                                                if (s5 !== oxi_FAILED) {
                                                                    oxi_reportedPos = s0;
                                                                    s1 = oxi_c71(s2, s3, s4, s5);
                                                                    s0 = s1;
                                                                } else {
                                                                    oxi_currPos = s0;
                                                                    s0 = oxi_c0;
                                                                }
                                                            } else {
                                                                oxi_currPos = s0;
                                                                s0 = oxi_c0;
                                                            }
                                                        } else {
                                                            oxi_currPos = s0;
                                                            s0 = oxi_c0;
                                                        }
                                                    } else {
                                                        oxi_currPos = s0;
                                                        s0 = oxi_c0;
                                                    }
                                                } else {
                                                    oxi_currPos = s0;
                                                    s0 = oxi_c0;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return s0;
        }

        function oxi_parseschars() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            s1 = [];
            s2 = oxi_parseschar();
            if (s2 !== oxi_FAILED) {
                while (s2 !== oxi_FAILED) {
                    s1.push(s2);
                    s2 = oxi_parseschar();
                }
            } else {
                s1 = oxi_c0;
            }
            if (s1 !== oxi_FAILED) {
                oxi_reportedPos = s0;
                s1 = oxi_c42(s1);
            }
            s0 = s1;

            return s0;
        }

        function oxi_parseschar() {
            var s0, s1, s2, s3, s4, s5;

            if (oxi_c72.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c73); }
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                if (input.substr(oxi_currPos, 2) === oxi_c74) {
                    s1 = oxi_c74;
                    oxi_currPos += 2;
                } else {
                    s1 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c75); }
                }
                if (s1 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c76();
                }
                s0 = s1;
                if (s0 === oxi_FAILED) {
                    s0 = oxi_currPos;
                    if (input.substr(oxi_currPos, 2) === oxi_c48) {
                        s1 = oxi_c48;
                        oxi_currPos += 2;
                    } else {
                        s1 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c49); }
                    }
                    if (s1 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c50();
                    }
                    s0 = s1;
                    if (s0 === oxi_FAILED) {
                        s0 = oxi_currPos;
                        if (input.substr(oxi_currPos, 2) === oxi_c51) {
                            s1 = oxi_c51;
                            oxi_currPos += 2;
                        } else {
                            s1 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c52); }
                        }
                        if (s1 !== oxi_FAILED) {
                            oxi_reportedPos = s0;
                            s1 = oxi_c53();
                        }
                        s0 = s1;
                        if (s0 === oxi_FAILED) {
                            s0 = oxi_currPos;
                            if (input.substr(oxi_currPos, 2) === oxi_c54) {
                                s1 = oxi_c54;
                                oxi_currPos += 2;
                            } else {
                                s1 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c55); }
                            }
                            if (s1 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c56();
                            }
                            s0 = s1;
                            if (s0 === oxi_FAILED) {
                                s0 = oxi_currPos;
                                if (input.substr(oxi_currPos, 2) === oxi_c57) {
                                    s1 = oxi_c57;
                                    oxi_currPos += 2;
                                } else {
                                    s1 = oxi_FAILED;
                                    if (oxi_silentFails === 0) { oxi_fail(oxi_c58); }
                                }
                                if (s1 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c59();
                                }
                                s0 = s1;
                                if (s0 === oxi_FAILED) {
                                    s0 = oxi_currPos;
                                    if (input.substr(oxi_currPos, 2) === oxi_c60) {
                                        s1 = oxi_c60;
                                        oxi_currPos += 2;
                                    } else {
                                        s1 = oxi_FAILED;
                                        if (oxi_silentFails === 0) { oxi_fail(oxi_c61); }
                                    }
                                    if (s1 !== oxi_FAILED) {
                                        oxi_reportedPos = s0;
                                        s1 = oxi_c62();
                                    }
                                    s0 = s1;
                                    if (s0 === oxi_FAILED) {
                                        s0 = oxi_currPos;
                                        if (input.substr(oxi_currPos, 2) === oxi_c63) {
                                            s1 = oxi_c63;
                                            oxi_currPos += 2;
                                        } else {
                                            s1 = oxi_FAILED;
                                            if (oxi_silentFails === 0) { oxi_fail(oxi_c64); }
                                        }
                                        if (s1 !== oxi_FAILED) {
                                            oxi_reportedPos = s0;
                                            s1 = oxi_c65();
                                        }
                                        s0 = s1;
                                        if (s0 === oxi_FAILED) {
                                            s0 = oxi_currPos;
                                            if (input.substr(oxi_currPos, 2) === oxi_c66) {
                                                s1 = oxi_c66;
                                                oxi_currPos += 2;
                                            } else {
                                                s1 = oxi_FAILED;
                                                if (oxi_silentFails === 0) { oxi_fail(oxi_c67); }
                                            }
                                            if (s1 !== oxi_FAILED) {
                                                oxi_reportedPos = s0;
                                                s1 = oxi_c68();
                                            }
                                            s0 = s1;
                                            if (s0 === oxi_FAILED) {
                                                s0 = oxi_currPos;
                                                if (input.substr(oxi_currPos, 2) === oxi_c69) {
                                                    s1 = oxi_c69;
                                                    oxi_currPos += 2;
                                                } else {
                                                    s1 = oxi_FAILED;
                                                    if (oxi_silentFails === 0) { oxi_fail(oxi_c70); }
                                                }
                                                if (s1 !== oxi_FAILED) {
                                                    s2 = oxi_parsehexDigit();
                                                    if (s2 !== oxi_FAILED) {
                                                        s3 = oxi_parsehexDigit();
                                                        if (s3 !== oxi_FAILED) {
                                                            s4 = oxi_parsehexDigit();
                                                            if (s4 !== oxi_FAILED) {
                                                                s5 = oxi_parsehexDigit();
                                                                if (s5 !== oxi_FAILED) {
                                                                    oxi_reportedPos = s0;
                                                                    s1 = oxi_c71(s2, s3, s4, s5);
                                                                    s0 = s1;
                                                                } else {
                                                                    oxi_currPos = s0;
                                                                    s0 = oxi_c0;
                                                                }
                                                            } else {
                                                                oxi_currPos = s0;
                                                                s0 = oxi_c0;
                                                            }
                                                        } else {
                                                            oxi_currPos = s0;
                                                            s0 = oxi_c0;
                                                        }
                                                    } else {
                                                        oxi_currPos = s0;
                                                        s0 = oxi_c0;
                                                    }
                                                } else {
                                                    oxi_currPos = s0;
                                                    s0 = oxi_c0;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return s0;
        }

        function oxi_parsekey() {
            var s0, s1, s2;

            oxi_silentFails++;
            s0 = oxi_parsestring();
            if (s0 === oxi_FAILED) {
                s0 = oxi_parsesingle();
                if (s0 === oxi_FAILED) {
                    s0 = oxi_currPos;
                    s1 = [];
                    if (oxi_c78.test(input.charAt(oxi_currPos))) {
                        s2 = input.charAt(oxi_currPos);
                        oxi_currPos++;
                    } else {
                        s2 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c79); }
                    }
                    if (s2 !== oxi_FAILED) {
                        while (s2 !== oxi_FAILED) {
                            s1.push(s2);
                            if (oxi_c78.test(input.charAt(oxi_currPos))) {
                                s2 = input.charAt(oxi_currPos);
                                oxi_currPos++;
                            } else {
                                s2 = oxi_FAILED;
                                if (oxi_silentFails === 0) { oxi_fail(oxi_c79); }
                            }
                        }
                    } else {
                        s1 = oxi_c0;
                    }
                    if (s1 !== oxi_FAILED) {
                        oxi_reportedPos = s0;
                        s1 = oxi_c80(s1);
                    }
                    s0 = s1;
                }
            }
            oxi_silentFails--;
            if (s0 === oxi_FAILED) {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c77); }
            }

            return s0;
        }

        function oxi_parseliteral() {
            var s0, s1;

            s0 = [];
            s1 = oxi_parselitchar();
            if (s1 !== oxi_FAILED) {
                while (s1 !== oxi_FAILED) {
                    s0.push(s1);
                    s1 = oxi_parselitchar();
                }
            } else {
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parselitchar() {
            var s0;

            if (oxi_c81.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c82); }
            }

            return s0;
        }

        function oxi_parsenumber() {
            var s0, s1, s2, s3, s4, s5, s6;

            oxi_silentFails++;
            s0 = oxi_currPos;
            s1 = oxi_parseint();
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsefrac();
                if (s2 !== oxi_FAILED) {
                    s3 = oxi_parseexp();
                    if (s3 !== oxi_FAILED) {
                        s4 = oxi_parse_();
                        if (s4 !== oxi_FAILED) {
                            s5 = [];
                            s6 = oxi_parselitchar();
                            while (s6 !== oxi_FAILED) {
                                s5.push(s6);
                                s6 = oxi_parselitchar();
                            }
                            if (s5 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c84(s1, s2, s3, s5);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_currPos;
                s1 = oxi_parseint();
                if (s1 !== oxi_FAILED) {
                    s2 = oxi_parsefrac();
                    if (s2 !== oxi_FAILED) {
                        s3 = oxi_parse_();
                        if (s3 !== oxi_FAILED) {
                            s4 = [];
                            s5 = oxi_parselitchar();
                            while (s5 !== oxi_FAILED) {
                                s4.push(s5);
                                s5 = oxi_parselitchar();
                            }
                            if (s4 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c85(s1, s2, s4);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
                if (s0 === oxi_FAILED) {
                    s0 = oxi_currPos;
                    s1 = oxi_parseint();
                    if (s1 !== oxi_FAILED) {
                        s2 = oxi_parseexp();
                        if (s2 !== oxi_FAILED) {
                            s3 = oxi_parse_();
                            if (s3 !== oxi_FAILED) {
                                s4 = [];
                                s5 = oxi_parselitchar();
                                while (s5 !== oxi_FAILED) {
                                    s4.push(s5);
                                    s5 = oxi_parselitchar();
                                }
                                if (s4 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c86(s1, s2, s4);
                                    s0 = s1;
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                    if (s0 === oxi_FAILED) {
                        s0 = oxi_currPos;
                        s1 = oxi_parseint();
                        if (s1 !== oxi_FAILED) {
                            s2 = oxi_parse_();
                            if (s2 !== oxi_FAILED) {
                                s3 = [];
                                s4 = oxi_parselitchar();
                                while (s4 !== oxi_FAILED) {
                                    s3.push(s4);
                                    s4 = oxi_parselitchar();
                                }
                                if (s3 !== oxi_FAILED) {
                                    oxi_reportedPos = s0;
                                    s1 = oxi_c87(s1, s3);
                                    s0 = s1;
                                } else {
                                    oxi_currPos = s0;
                                    s0 = oxi_c0;
                                }
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    }
                }
            }
            oxi_silentFails--;
            if (s0 === oxi_FAILED) {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c83); }
            }

            return s0;
        }

        function oxi_parseint() {
            var s0, s1, s2, s3;

            s0 = oxi_currPos;
            s1 = oxi_parsedigit19();
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsedigits();
                if (s2 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c88(s1, s2);
                    s0 = s1;
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }
            if (s0 === oxi_FAILED) {
                s0 = oxi_parsedigit();
                if (s0 === oxi_FAILED) {
                    s0 = oxi_currPos;
                    if (input.charCodeAt(oxi_currPos) === 45) {
                        s1 = oxi_c89;
                        oxi_currPos++;
                    } else {
                        s1 = oxi_FAILED;
                        if (oxi_silentFails === 0) { oxi_fail(oxi_c90); }
                    }
                    if (s1 !== oxi_FAILED) {
                        s2 = oxi_parsedigit19();
                        if (s2 !== oxi_FAILED) {
                            s3 = oxi_parsedigits();
                            if (s3 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c91(s2, s3);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    } else {
                        oxi_currPos = s0;
                        s0 = oxi_c0;
                    }
                    if (s0 === oxi_FAILED) {
                        s0 = oxi_currPos;
                        if (input.charCodeAt(oxi_currPos) === 45) {
                            s1 = oxi_c89;
                            oxi_currPos++;
                        } else {
                            s1 = oxi_FAILED;
                            if (oxi_silentFails === 0) { oxi_fail(oxi_c90); }
                        }
                        if (s1 !== oxi_FAILED) {
                            s2 = oxi_parsedigit();
                            if (s2 !== oxi_FAILED) {
                                oxi_reportedPos = s0;
                                s1 = oxi_c92(s2);
                                s0 = s1;
                            } else {
                                oxi_currPos = s0;
                                s0 = oxi_c0;
                            }
                        } else {
                            oxi_currPos = s0;
                            s0 = oxi_c0;
                        }
                    }
                }
            }

            return s0;
        }

        function oxi_parsefrac() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            if (input.charCodeAt(oxi_currPos) === 46) {
                s1 = oxi_c93;
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c94); }
            }
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsedigits();
                if (s2 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c95(s2);
                    s0 = s1;
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parseexp() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            s1 = oxi_parsee();
            if (s1 !== oxi_FAILED) {
                s2 = oxi_parsedigits();
                if (s2 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c96(s1, s2);
                    s0 = s1;
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parsedigits() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            s1 = [];
            s2 = oxi_parsedigit();
            if (s2 !== oxi_FAILED) {
                while (s2 !== oxi_FAILED) {
                    s1.push(s2);
                    s2 = oxi_parsedigit();
                }
            } else {
                s1 = oxi_c0;
            }
            if (s1 !== oxi_FAILED) {
                oxi_reportedPos = s0;
                s1 = oxi_c97(s1);
            }
            s0 = s1;

            return s0;
        }

        function oxi_parsee() {
            var s0, s1, s2;

            s0 = oxi_currPos;
            if (oxi_c98.test(input.charAt(oxi_currPos))) {
                s1 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c99); }
            }
            if (s1 !== oxi_FAILED) {
                if (oxi_c100.test(input.charAt(oxi_currPos))) {
                    s2 = input.charAt(oxi_currPos);
                    oxi_currPos++;
                } else {
                    s2 = oxi_FAILED;
                    if (oxi_silentFails === 0) { oxi_fail(oxi_c101); }
                }
                if (s2 === oxi_FAILED) {
                    s2 = oxi_c9;
                }
                if (s2 !== oxi_FAILED) {
                    oxi_reportedPos = s0;
                    s1 = oxi_c102(s1, s2);
                    s0 = s1;
                } else {
                    oxi_currPos = s0;
                    s0 = oxi_c0;
                }
            } else {
                oxi_currPos = s0;
                s0 = oxi_c0;
            }

            return s0;
        }

        function oxi_parsedigit() {
            var s0;

            if (oxi_c103.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c104); }
            }

            return s0;
        }

        function oxi_parsedigit19() {
            var s0;

            if (oxi_c105.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c106); }
            }

            return s0;
        }

        function oxi_parsehexDigit() {
            var s0;

            if (oxi_c107.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c108); }
            }

            return s0;
        }

        function oxi_parse_() {
            var s0, s1;

            oxi_silentFails++;
            s0 = [];
            s1 = oxi_parsewhitespace();
            while (s1 !== oxi_FAILED) {
                s0.push(s1);
                s1 = oxi_parsewhitespace();
            }
            oxi_silentFails--;
            if (s0 === oxi_FAILED) {
                s1 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c109); }
            }

            return s0;
        }

        function oxi_parsewhitespace() {
            var s0;

            if (oxi_c110.test(input.charAt(oxi_currPos))) {
                s0 = input.charAt(oxi_currPos);
                oxi_currPos++;
            } else {
                s0 = oxi_FAILED;
                if (oxi_silentFails === 0) { oxi_fail(oxi_c111); }
            }

            return s0;
        }


        /*
         * We can't return |null| in the |value| rule because that would mean parse
         * failure. So we return a special object instead and convert it to |null|
         * later.
         */

        var null_ = new Object;

        function fixNull(value) {
            return value === null_ ? null : value;
        }


        oxi_result = oxi_startRuleFunction();

        if (oxi_result !== oxi_FAILED && oxi_currPos === input.length) {
            return oxi_result;
        } else {
            if (oxi_result !== oxi_FAILED && oxi_currPos < input.length) {
                oxi_fail({ type: "end", description: "end of input" });
            }

            throw oxi_buildException(null, oxi_maxFailExpected, oxi_maxFailPos);
        }
    }

    return {
        SyntaxError: SyntaxError,
        parse: parse
    };
})();


function stringify(val, opts, depth) {
    depth++
    if (null == val) return 'null';

    var type = Object.prototype.toString.call(val).charAt(8);
    if ('F' === type && !opts.showfunc) return null;

    // WARNING: output may not be jsonically parsable!
    if (opts.custom) {
        if (val.hasOwnProperty('toString')) {
            return val.toString()
        } else if (val.hasOwnProperty('inspect')) {
            return val.inspect()
        }
    }


    var out, i = 0,
        j, k;

    if ('N' === type) {
        return isNaN(val) ? 'null' : val.toString();
    } else if ('O' === type) {
        out = []
        if (depth <= opts.depth) {
            j = 0
            for (i in val) {
                if (j >= opts.maxitems) break;

                var pass = true
                for (k = 0; k < opts.exclude.length && pass; k++) {
                    pass = !~i.indexOf(opts.exclude[k])
                }
                pass = pass && !opts.omit[i]

                var str = stringify(val[i], opts, depth)

                if (null != str && pass) {
                    var n = i.match(/^[a-zA-Z0-9_$]+$/) ? i : JSON.stringify(i)
                    out.push(n + ':' + str)
                    j++
                }
            }
        }
        return '{' + out.join(',') + '}'
    } else if ('A' === type) {
        out = []
        if (depth <= opts.depth) {
            for (; i < val.length && i < opts.maxitems; i++) {
                var str = stringify(val[i], opts, depth)
                if (null != str) {
                    out.push(str)
                }
            }
        }
        return '[' + out.join(',') + ']'
    } else {
        var valstr = val.toString();

        if (~" \"'\r\n\t,}]".indexOf(valstr[0]) ||
            !~valstr.match(/,}]/) ||
            ~" \r\n\t".indexOf(valstr[valstr.length - 1])) {
            valstr = "'" + valstr.replace(/'/g, "\\'") + "'"
        }

        return valstr;
    }
}


jsonic.stringify = function(val, callopts) {
    try {
        var callopts = callopts || {};
        var opts = {};

        opts.showfunc = callopts.showfunc || callopts.f || false;
        opts.custom = callopts.custom || callopts.c || false;
        opts.depth = callopts.depth || callopts.d || 3;
        opts.maxitems = callopts.maxitems || callopts.mi || 11;
        opts.maxchars = callopts.maxchars || callopts.mc || 111;
        opts.exclude = callopts.exclude || callopts.x || ['$'];
        var omit = callopts.omit || callopts.o || [];

        opts.omit = {}
        for (var i = 0; i < omit.length; i++) {
            opts.omit[omit[i]] = true;
        }

        var str = stringify(val, opts, 0);
        str = null == str ? '' : str.substring(0, opts.maxchars);
        return str;
    } catch (e) {
        return 'ERROR: jsonic.stringify: ' + e + ' input was: ' + JSON.stringify(val)
    }
}

export default jsonic