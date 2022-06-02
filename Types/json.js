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

    function storm_subclass(child, parent) {
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

    storm_subclass(SyntaxError, Error);

    function parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {},

            storm_FAILED = {},

            storm_startRuleFunctions = { start: storm_parsestart },
            storm_startRuleFunction = storm_parsestart,

            storm_c0 = storm_FAILED,
            storm_c1 = function(object) { return object; },
            storm_c2 = function(array) { return array; },
            storm_c3 = "{",
            storm_c4 = { type: "literal", value: "{", description: "\"{\"" },
            storm_c5 = "}",
            storm_c6 = { type: "literal", value: "}", description: "\"}\"" },
            storm_c7 = function() { return {}; },
            storm_c8 = function(members) { return members; },
            storm_c9 = null,
            storm_c10 = ",",
            storm_c11 = { type: "literal", value: ",", description: "\",\"" },
            storm_c12 = [],
            storm_c13 = function(head, tail) {
                var result = {};
                if (head) { result[head[0]] = fixNull(head[1]); }
                for (var i = 0; i < tail.length; i++) {
                    result[tail[i][2][0]] = fixNull(tail[i][2][1]);
                }
                return result;
            },
            storm_c14 = ":",
            storm_c15 = { type: "literal", value: ":", description: "\":\"" },
            storm_c16 = function(name, value) { return [name, value]; },
            storm_c17 = "[",
            storm_c18 = { type: "literal", value: "[", description: "\"[\"" },
            storm_c19 = "]",
            storm_c20 = { type: "literal", value: "]", description: "\"]\"" },
            storm_c21 = function() { return []; },
            storm_c22 = function(elements) { return elements; },
            storm_c23 = function(head, tail) {
                var result = [];
                if (typeof head !== 'undefined' && head !== null) { result.push(fixNull(head)) }
                for (var i = 0; i < tail.length; i++) {
                    result.push(fixNull(tail[i][2]));
                }
                return result;
            },
            storm_c24 = "true",
            storm_c25 = { type: "literal", value: "true", description: "\"true\"" },
            storm_c26 = function() { return true; },
            storm_c27 = "false",
            storm_c28 = { type: "literal", value: "false", description: "\"false\"" },
            storm_c29 = function() { return false; },
            storm_c30 = "null",
            storm_c31 = { type: "literal", value: "null", description: "\"null\"" },
            storm_c32 = function() { return null_; },
            storm_c33 = function(lit) { return lit.join('').trim() },
            storm_c34 = { type: "other", description: "double-quote string" },
            storm_c35 = "\"",
            storm_c36 = { type: "literal", value: "\"", description: "\"\\\"\"" },
            storm_c37 = function() { return ""; },
            storm_c38 = function(chars) { return chars; },
            storm_c39 = { type: "other", description: "single-quote string" },
            storm_c40 = "'",
            storm_c41 = { type: "literal", value: "'", description: "\"'\"" },
            storm_c42 = function(chars) { return chars.join(""); },
            storm_c43 = /^[^"\\\0-\x1F]/,
            storm_c44 = { type: "class", value: "[^\"\\\\\\0-\\x1F]", description: "[^\"\\\\\\0-\\x1F]" },
            storm_c45 = "\\\"",
            storm_c46 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
            storm_c47 = function() { return '"'; },
            storm_c48 = "\\\\",
            storm_c49 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
            storm_c50 = function() { return "\\"; },
            storm_c51 = "\\/",
            storm_c52 = { type: "literal", value: "\\/", description: "\"\\\\/\"" },
            storm_c53 = function() { return "/"; },
            storm_c54 = "\\b",
            storm_c55 = { type: "literal", value: "\\b", description: "\"\\\\b\"" },
            storm_c56 = function() { return "\b"; },
            storm_c57 = "\\f",
            storm_c58 = { type: "literal", value: "\\f", description: "\"\\\\f\"" },
            storm_c59 = function() { return "\f"; },
            storm_c60 = "\\n",
            storm_c61 = { type: "literal", value: "\\n", description: "\"\\\\n\"" },
            storm_c62 = function() { return "\n"; },
            storm_c63 = "\\r",
            storm_c64 = { type: "literal", value: "\\r", description: "\"\\\\r\"" },
            storm_c65 = function() { return "\r"; },
            storm_c66 = "\\t",
            storm_c67 = { type: "literal", value: "\\t", description: "\"\\\\t\"" },
            storm_c68 = function() { return "\t"; },
            storm_c69 = "\\u",
            storm_c70 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
            storm_c71 = function(h1, h2, h3, h4) {
                return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
            },
            storm_c72 = /^[^'\\\0-\x1F]/,
            storm_c73 = { type: "class", value: "[^'\\\\\\0-\\x1F]", description: "[^'\\\\\\0-\\x1F]" },
            storm_c74 = "\\'",
            storm_c75 = { type: "literal", value: "\\'", description: "\"\\\\'\"" },
            storm_c76 = function() { return '\''; },
            storm_c77 = { type: "other", description: "key" },
            storm_c78 = /^[a-zA-Z0-9_$\-]/,
            storm_c79 = { type: "class", value: "[a-zA-Z0-9_$\\-]", description: "[a-zA-Z0-9_$\\-]" },
            storm_c80 = function(chars) { return chars.join('') },
            storm_c81 = /^[^,}\]]/,
            storm_c82 = { type: "class", value: "[^,}\\]]", description: "[^,}\\]]" },
            storm_c83 = { type: "other", description: "number" },
            storm_c84 = function(int_, frac, exp, suffix) { return 0 === suffix.length ? parseFloat(int_ + frac + exp) : (int_ + frac + exp + suffix.join('')).trim(); },
            storm_c85 = function(int_, frac, suffix) { return 0 === suffix.length ? parseFloat(int_ + frac) : (int_ + frac + suffix.join('')).trim(); },
            storm_c86 = function(int_, exp, suffix) { return 0 === suffix.length ? parseFloat(int_ + exp) : (int_ + exp + suffix.join('')).trim(); },
            storm_c87 = function(int_, suffix) { return 0 === suffix.length ? parseFloat(int_) : (int_ + suffix.join('')).trim(); },
            storm_c88 = function(digit19, digits) { return digit19 + digits; },
            storm_c89 = "-",
            storm_c90 = { type: "literal", value: "-", description: "\"-\"" },
            storm_c91 = function(digit19, digits) { return "-" + digit19 + digits; },
            storm_c92 = function(digit) { return "-" + digit; },
            storm_c93 = ".",
            storm_c94 = { type: "literal", value: ".", description: "\".\"" },
            storm_c95 = function(digits) { return "." + digits; },
            storm_c96 = function(e, digits) { return e + digits; },
            storm_c97 = function(digits) { return digits.join(""); },
            storm_c98 = /^[eE]/,
            storm_c99 = { type: "class", value: "[eE]", description: "[eE]" },
            storm_c100 = /^[+\-]/,
            storm_c101 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
            storm_c102 = function(e, sign) { return e + (sign ? sign : ''); },
            storm_c103 = /^[0-9]/,
            storm_c104 = { type: "class", value: "[0-9]", description: "[0-9]" },
            storm_c105 = /^[1-9]/,
            storm_c106 = { type: "class", value: "[1-9]", description: "[1-9]" },
            storm_c107 = /^[0-9a-fA-F]/,
            storm_c108 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
            storm_c109 = { type: "other", description: "whitespace" },
            storm_c110 = /^[ \t\n\r]/,
            storm_c111 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

            storm_currPos = 0,
            storm_reportedPos = 0,
            storm_cachedPos = 0,
            storm_cachedPosDetails = { line: 1, column: 1, seenCR: false },
            storm_maxFailPos = 0,
            storm_maxFailExpected = [],
            storm_silentFails = 0,

            storm_result;

        if ("startRule" in options) {
            if (!(options.startRule in storm_startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }

            storm_startRuleFunction = storm_startRuleFunctions[options.startRule];
        }

        function storm_computePosDetails(pos) {
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

            if (storm_cachedPos !== pos) {
                if (storm_cachedPos > pos) {
                    storm_cachedPos = 0;
                    storm_cachedPosDetails = { line: 1, column: 1, seenCR: false };
                }
                advance(storm_cachedPosDetails, storm_cachedPos, pos);
                storm_cachedPos = pos;
            }

            return storm_cachedPosDetails;
        }

        function storm_fail(expected) {
            if (storm_currPos < storm_maxFailPos) { return; }

            if (storm_currPos > storm_maxFailPos) {
                storm_maxFailPos = storm_currPos;
                storm_maxFailExpected = [];
            }

            storm_maxFailExpected.push(expected);
        }

        function storm_buildException(message, expected, pos) {
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

            var posDetails = storm_computePosDetails(pos),
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

        function storm_parsestart() {
            var s0, s1, s2;

            s0 = storm_currPos;
            s1 = storm_parse_();
            if (s1 !== storm_FAILED) {
                s2 = storm_parseobject();
                if (s2 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c1(s2);
                    s0 = s1;
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                s1 = storm_parse_();
                if (s1 !== storm_FAILED) {
                    s2 = storm_parsearray();
                    if (s2 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c2(s2);
                        s0 = s1;
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            }

            return s0;
        }

        function storm_parseobject() {
            var s0, s1, s2, s3, s4, s5;

            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 123) {
                s1 = storm_c3;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c4); }
            }
            if (s1 !== storm_FAILED) {
                s2 = storm_parse_();
                if (s2 !== storm_FAILED) {
                    if (input.charCodeAt(storm_currPos) === 125) {
                        s3 = storm_c5;
                        storm_currPos++;
                    } else {
                        s3 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c6); }
                    }
                    if (s3 !== storm_FAILED) {
                        s4 = storm_parse_();
                        if (s4 !== storm_FAILED) {
                            storm_reportedPos = s0;
                            s1 = storm_c7();
                            s0 = s1;
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.charCodeAt(storm_currPos) === 123) {
                    s1 = storm_c3;
                    storm_currPos++;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c4); }
                }
                if (s1 !== storm_FAILED) {
                    s2 = storm_parse_();
                    if (s2 !== storm_FAILED) {
                        s3 = storm_parsemembers();
                        if (s3 !== storm_FAILED) {
                            if (input.charCodeAt(storm_currPos) === 125) {
                                s4 = storm_c5;
                                storm_currPos++;
                            } else {
                                s4 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c6); }
                            }
                            if (s4 !== storm_FAILED) {
                                s5 = storm_parse_();
                                if (s5 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c8(s3);
                                    s0 = s1;
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            }

            return s0;
        }

        function storm_parsemembers() {
            var s0, s1, s2, s3, s4, s5, s6, s7;

            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 44) {
                s1 = storm_c10;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c11); }
            }
            if (s1 === storm_FAILED) {
                s1 = storm_c9;
            }
            if (s1 !== storm_FAILED) {
                s2 = storm_parsepair();
                if (s2 === storm_FAILED) {
                    s2 = storm_c9;
                }
                if (s2 !== storm_FAILED) {
                    s3 = [];
                    s4 = storm_currPos;
                    if (input.charCodeAt(storm_currPos) === 44) {
                        s5 = storm_c10;
                        storm_currPos++;
                    } else {
                        s5 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c11); }
                    }
                    if (s5 !== storm_FAILED) {
                        s6 = storm_parse_();
                        if (s6 !== storm_FAILED) {
                            s7 = storm_parsepair();
                            if (s7 !== storm_FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            } else {
                                storm_currPos = s4;
                                s4 = storm_c0;
                            }
                        } else {
                            storm_currPos = s4;
                            s4 = storm_c0;
                        }
                    } else {
                        storm_currPos = s4;
                        s4 = storm_c0;
                    }
                    while (s4 !== storm_FAILED) {
                        s3.push(s4);
                        s4 = storm_currPos;
                        if (input.charCodeAt(storm_currPos) === 44) {
                            s5 = storm_c10;
                            storm_currPos++;
                        } else {
                            s5 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c11); }
                        }
                        if (s5 !== storm_FAILED) {
                            s6 = storm_parse_();
                            if (s6 !== storm_FAILED) {
                                s7 = storm_parsepair();
                                if (s7 !== storm_FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                } else {
                                    storm_currPos = s4;
                                    s4 = storm_c0;
                                }
                            } else {
                                storm_currPos = s4;
                                s4 = storm_c0;
                            }
                        } else {
                            storm_currPos = s4;
                            s4 = storm_c0;
                        }
                    }
                    if (s3 !== storm_FAILED) {
                        if (input.charCodeAt(storm_currPos) === 44) {
                            s4 = storm_c10;
                            storm_currPos++;
                        } else {
                            s4 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c11); }
                        }
                        if (s4 === storm_FAILED) {
                            s4 = storm_c9;
                        }
                        if (s4 !== storm_FAILED) {
                            s5 = storm_parse_();
                            if (s5 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c13(s2, s3);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parsepair() {
            var s0, s1, s2, s3, s4, s5;

            s0 = storm_currPos;
            s1 = storm_parsekey();
            if (s1 !== storm_FAILED) {
                s2 = storm_parse_();
                if (s2 !== storm_FAILED) {
                    if (input.charCodeAt(storm_currPos) === 58) {
                        s3 = storm_c14;
                        storm_currPos++;
                    } else {
                        s3 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c15); }
                    }
                    if (s3 !== storm_FAILED) {
                        s4 = storm_parse_();
                        if (s4 !== storm_FAILED) {
                            s5 = storm_parsevalue();
                            if (s5 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c16(s1, s5);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parsearray() {
            var s0, s1, s2, s3, s4, s5;

            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 91) {
                s1 = storm_c17;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c18); }
            }
            if (s1 !== storm_FAILED) {
                s2 = storm_parse_();
                if (s2 !== storm_FAILED) {
                    if (input.charCodeAt(storm_currPos) === 93) {
                        s3 = storm_c19;
                        storm_currPos++;
                    } else {
                        s3 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c20); }
                    }
                    if (s3 !== storm_FAILED) {
                        s4 = storm_parse_();
                        if (s4 !== storm_FAILED) {
                            storm_reportedPos = s0;
                            s1 = storm_c21();
                            s0 = s1;
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.charCodeAt(storm_currPos) === 91) {
                    s1 = storm_c17;
                    storm_currPos++;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c18); }
                }
                if (s1 !== storm_FAILED) {
                    s2 = storm_parse_();
                    if (s2 !== storm_FAILED) {
                        s3 = storm_parseelements();
                        if (s3 !== storm_FAILED) {
                            if (input.charCodeAt(storm_currPos) === 93) {
                                s4 = storm_c19;
                                storm_currPos++;
                            } else {
                                s4 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c20); }
                            }
                            if (s4 !== storm_FAILED) {
                                s5 = storm_parse_();
                                if (s5 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c22(s3);
                                    s0 = s1;
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            }

            return s0;
        }

        function storm_parseelements() {
            var s0, s1, s2, s3, s4, s5, s6, s7;

            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 44) {
                s1 = storm_c10;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c11); }
            }
            if (s1 === storm_FAILED) {
                s1 = storm_c9;
            }
            if (s1 !== storm_FAILED) {
                s2 = storm_parsevalue();
                if (s2 === storm_FAILED) {
                    s2 = storm_c9;
                }
                if (s2 !== storm_FAILED) {
                    s3 = [];
                    s4 = storm_currPos;
                    if (input.charCodeAt(storm_currPos) === 44) {
                        s5 = storm_c10;
                        storm_currPos++;
                    } else {
                        s5 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c11); }
                    }
                    if (s5 !== storm_FAILED) {
                        s6 = storm_parse_();
                        if (s6 !== storm_FAILED) {
                            s7 = storm_parsevalue();
                            if (s7 !== storm_FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            } else {
                                storm_currPos = s4;
                                s4 = storm_c0;
                            }
                        } else {
                            storm_currPos = s4;
                            s4 = storm_c0;
                        }
                    } else {
                        storm_currPos = s4;
                        s4 = storm_c0;
                    }
                    while (s4 !== storm_FAILED) {
                        s3.push(s4);
                        s4 = storm_currPos;
                        if (input.charCodeAt(storm_currPos) === 44) {
                            s5 = storm_c10;
                            storm_currPos++;
                        } else {
                            s5 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c11); }
                        }
                        if (s5 !== storm_FAILED) {
                            s6 = storm_parse_();
                            if (s6 !== storm_FAILED) {
                                s7 = storm_parsevalue();
                                if (s7 !== storm_FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                } else {
                                    storm_currPos = s4;
                                    s4 = storm_c0;
                                }
                            } else {
                                storm_currPos = s4;
                                s4 = storm_c0;
                            }
                        } else {
                            storm_currPos = s4;
                            s4 = storm_c0;
                        }
                    }
                    if (s3 !== storm_FAILED) {
                        if (input.charCodeAt(storm_currPos) === 44) {
                            s4 = storm_c10;
                            storm_currPos++;
                        } else {
                            s4 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c11); }
                        }
                        if (s4 === storm_FAILED) {
                            s4 = storm_c9;
                        }
                        if (s4 !== storm_FAILED) {
                            s5 = storm_parse_();
                            if (s5 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c23(s2, s3);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parsevalue() {
            var s0, s1, s2;

            s0 = storm_parsestring();
            if (s0 === storm_FAILED) {
                s0 = storm_parsesingle();
                if (s0 === storm_FAILED) {
                    s0 = storm_parseobject();
                    if (s0 === storm_FAILED) {
                        s0 = storm_parsearray();
                        if (s0 === storm_FAILED) {
                            s0 = storm_currPos;
                            if (input.substr(storm_currPos, 4) === storm_c24) {
                                s1 = storm_c24;
                                storm_currPos += 4;
                            } else {
                                s1 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c25); }
                            }
                            if (s1 !== storm_FAILED) {
                                s2 = storm_parse_();
                                if (s2 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c26();
                                    s0 = s1;
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                            if (s0 === storm_FAILED) {
                                s0 = storm_currPos;
                                if (input.substr(storm_currPos, 5) === storm_c27) {
                                    s1 = storm_c27;
                                    storm_currPos += 5;
                                } else {
                                    s1 = storm_FAILED;
                                    if (storm_silentFails === 0) { storm_fail(storm_c28); }
                                }
                                if (s1 !== storm_FAILED) {
                                    s2 = storm_parse_();
                                    if (s2 !== storm_FAILED) {
                                        storm_reportedPos = s0;
                                        s1 = storm_c29();
                                        s0 = s1;
                                    } else {
                                        storm_currPos = s0;
                                        s0 = storm_c0;
                                    }
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                                if (s0 === storm_FAILED) {
                                    s0 = storm_currPos;
                                    if (input.substr(storm_currPos, 4) === storm_c30) {
                                        s1 = storm_c30;
                                        storm_currPos += 4;
                                    } else {
                                        s1 = storm_FAILED;
                                        if (storm_silentFails === 0) { storm_fail(storm_c31); }
                                    }
                                    if (s1 !== storm_FAILED) {
                                        s2 = storm_parse_();
                                        if (s2 !== storm_FAILED) {
                                            storm_reportedPos = s0;
                                            s1 = storm_c32();
                                            s0 = s1;
                                        } else {
                                            storm_currPos = s0;
                                            s0 = storm_c0;
                                        }
                                    } else {
                                        storm_currPos = s0;
                                        s0 = storm_c0;
                                    }
                                    if (s0 === storm_FAILED) {
                                        s0 = storm_parsenumber();
                                        if (s0 === storm_FAILED) {
                                            s0 = storm_currPos;
                                            s1 = storm_parseliteral();
                                            if (s1 !== storm_FAILED) {
                                                storm_reportedPos = s0;
                                                s1 = storm_c33(s1);
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

        function storm_parsestring() {
            var s0, s1, s2, s3, s4;

            storm_silentFails++;
            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 34) {
                s1 = storm_c35;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c36); }
            }
            if (s1 !== storm_FAILED) {
                if (input.charCodeAt(storm_currPos) === 34) {
                    s2 = storm_c35;
                    storm_currPos++;
                } else {
                    s2 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c36); }
                }
                if (s2 !== storm_FAILED) {
                    s3 = storm_parse_();
                    if (s3 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c37();
                        s0 = s1;
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.charCodeAt(storm_currPos) === 34) {
                    s1 = storm_c35;
                    storm_currPos++;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c36); }
                }
                if (s1 !== storm_FAILED) {
                    s2 = storm_parsechars();
                    if (s2 !== storm_FAILED) {
                        if (input.charCodeAt(storm_currPos) === 34) {
                            s3 = storm_c35;
                            storm_currPos++;
                        } else {
                            s3 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c36); }
                        }
                        if (s3 !== storm_FAILED) {
                            s4 = storm_parse_();
                            if (s4 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c38(s2);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            }
            storm_silentFails--;
            if (s0 === storm_FAILED) {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c34); }
            }

            return s0;
        }

        function storm_parsesingle() {
            var s0, s1, s2, s3, s4;

            storm_silentFails++;
            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 39) {
                s1 = storm_c40;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c41); }
            }
            if (s1 !== storm_FAILED) {
                if (input.charCodeAt(storm_currPos) === 39) {
                    s2 = storm_c40;
                    storm_currPos++;
                } else {
                    s2 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c41); }
                }
                if (s2 !== storm_FAILED) {
                    s3 = storm_parse_();
                    if (s3 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c37();
                        s0 = s1;
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.charCodeAt(storm_currPos) === 39) {
                    s1 = storm_c40;
                    storm_currPos++;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c41); }
                }
                if (s1 !== storm_FAILED) {
                    s2 = storm_parseschars();
                    if (s2 !== storm_FAILED) {
                        if (input.charCodeAt(storm_currPos) === 39) {
                            s3 = storm_c40;
                            storm_currPos++;
                        } else {
                            s3 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c41); }
                        }
                        if (s3 !== storm_FAILED) {
                            s4 = storm_parse_();
                            if (s4 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c38(s2);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            }
            storm_silentFails--;
            if (s0 === storm_FAILED) {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c39); }
            }

            return s0;
        }

        function storm_parsechars() {
            var s0, s1, s2;

            s0 = storm_currPos;
            s1 = [];
            s2 = storm_parsechar();
            if (s2 !== storm_FAILED) {
                while (s2 !== storm_FAILED) {
                    s1.push(s2);
                    s2 = storm_parsechar();
                }
            } else {
                s1 = storm_c0;
            }
            if (s1 !== storm_FAILED) {
                storm_reportedPos = s0;
                s1 = storm_c42(s1);
            }
            s0 = s1;

            return s0;
        }

        function storm_parsechar() {
            var s0, s1, s2, s3, s4, s5;

            if (storm_c43.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c44); }
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.substr(storm_currPos, 2) === storm_c45) {
                    s1 = storm_c45;
                    storm_currPos += 2;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c46); }
                }
                if (s1 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c47();
                }
                s0 = s1;
                if (s0 === storm_FAILED) {
                    s0 = storm_currPos;
                    if (input.substr(storm_currPos, 2) === storm_c48) {
                        s1 = storm_c48;
                        storm_currPos += 2;
                    } else {
                        s1 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c49); }
                    }
                    if (s1 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c50();
                    }
                    s0 = s1;
                    if (s0 === storm_FAILED) {
                        s0 = storm_currPos;
                        if (input.substr(storm_currPos, 2) === storm_c51) {
                            s1 = storm_c51;
                            storm_currPos += 2;
                        } else {
                            s1 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c52); }
                        }
                        if (s1 !== storm_FAILED) {
                            storm_reportedPos = s0;
                            s1 = storm_c53();
                        }
                        s0 = s1;
                        if (s0 === storm_FAILED) {
                            s0 = storm_currPos;
                            if (input.substr(storm_currPos, 2) === storm_c54) {
                                s1 = storm_c54;
                                storm_currPos += 2;
                            } else {
                                s1 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c55); }
                            }
                            if (s1 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c56();
                            }
                            s0 = s1;
                            if (s0 === storm_FAILED) {
                                s0 = storm_currPos;
                                if (input.substr(storm_currPos, 2) === storm_c57) {
                                    s1 = storm_c57;
                                    storm_currPos += 2;
                                } else {
                                    s1 = storm_FAILED;
                                    if (storm_silentFails === 0) { storm_fail(storm_c58); }
                                }
                                if (s1 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c59();
                                }
                                s0 = s1;
                                if (s0 === storm_FAILED) {
                                    s0 = storm_currPos;
                                    if (input.substr(storm_currPos, 2) === storm_c60) {
                                        s1 = storm_c60;
                                        storm_currPos += 2;
                                    } else {
                                        s1 = storm_FAILED;
                                        if (storm_silentFails === 0) { storm_fail(storm_c61); }
                                    }
                                    if (s1 !== storm_FAILED) {
                                        storm_reportedPos = s0;
                                        s1 = storm_c62();
                                    }
                                    s0 = s1;
                                    if (s0 === storm_FAILED) {
                                        s0 = storm_currPos;
                                        if (input.substr(storm_currPos, 2) === storm_c63) {
                                            s1 = storm_c63;
                                            storm_currPos += 2;
                                        } else {
                                            s1 = storm_FAILED;
                                            if (storm_silentFails === 0) { storm_fail(storm_c64); }
                                        }
                                        if (s1 !== storm_FAILED) {
                                            storm_reportedPos = s0;
                                            s1 = storm_c65();
                                        }
                                        s0 = s1;
                                        if (s0 === storm_FAILED) {
                                            s0 = storm_currPos;
                                            if (input.substr(storm_currPos, 2) === storm_c66) {
                                                s1 = storm_c66;
                                                storm_currPos += 2;
                                            } else {
                                                s1 = storm_FAILED;
                                                if (storm_silentFails === 0) { storm_fail(storm_c67); }
                                            }
                                            if (s1 !== storm_FAILED) {
                                                storm_reportedPos = s0;
                                                s1 = storm_c68();
                                            }
                                            s0 = s1;
                                            if (s0 === storm_FAILED) {
                                                s0 = storm_currPos;
                                                if (input.substr(storm_currPos, 2) === storm_c69) {
                                                    s1 = storm_c69;
                                                    storm_currPos += 2;
                                                } else {
                                                    s1 = storm_FAILED;
                                                    if (storm_silentFails === 0) { storm_fail(storm_c70); }
                                                }
                                                if (s1 !== storm_FAILED) {
                                                    s2 = storm_parsehexDigit();
                                                    if (s2 !== storm_FAILED) {
                                                        s3 = storm_parsehexDigit();
                                                        if (s3 !== storm_FAILED) {
                                                            s4 = storm_parsehexDigit();
                                                            if (s4 !== storm_FAILED) {
                                                                s5 = storm_parsehexDigit();
                                                                if (s5 !== storm_FAILED) {
                                                                    storm_reportedPos = s0;
                                                                    s1 = storm_c71(s2, s3, s4, s5);
                                                                    s0 = s1;
                                                                } else {
                                                                    storm_currPos = s0;
                                                                    s0 = storm_c0;
                                                                }
                                                            } else {
                                                                storm_currPos = s0;
                                                                s0 = storm_c0;
                                                            }
                                                        } else {
                                                            storm_currPos = s0;
                                                            s0 = storm_c0;
                                                        }
                                                    } else {
                                                        storm_currPos = s0;
                                                        s0 = storm_c0;
                                                    }
                                                } else {
                                                    storm_currPos = s0;
                                                    s0 = storm_c0;
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

        function storm_parseschars() {
            var s0, s1, s2;

            s0 = storm_currPos;
            s1 = [];
            s2 = storm_parseschar();
            if (s2 !== storm_FAILED) {
                while (s2 !== storm_FAILED) {
                    s1.push(s2);
                    s2 = storm_parseschar();
                }
            } else {
                s1 = storm_c0;
            }
            if (s1 !== storm_FAILED) {
                storm_reportedPos = s0;
                s1 = storm_c42(s1);
            }
            s0 = s1;

            return s0;
        }

        function storm_parseschar() {
            var s0, s1, s2, s3, s4, s5;

            if (storm_c72.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c73); }
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                if (input.substr(storm_currPos, 2) === storm_c74) {
                    s1 = storm_c74;
                    storm_currPos += 2;
                } else {
                    s1 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c75); }
                }
                if (s1 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c76();
                }
                s0 = s1;
                if (s0 === storm_FAILED) {
                    s0 = storm_currPos;
                    if (input.substr(storm_currPos, 2) === storm_c48) {
                        s1 = storm_c48;
                        storm_currPos += 2;
                    } else {
                        s1 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c49); }
                    }
                    if (s1 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c50();
                    }
                    s0 = s1;
                    if (s0 === storm_FAILED) {
                        s0 = storm_currPos;
                        if (input.substr(storm_currPos, 2) === storm_c51) {
                            s1 = storm_c51;
                            storm_currPos += 2;
                        } else {
                            s1 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c52); }
                        }
                        if (s1 !== storm_FAILED) {
                            storm_reportedPos = s0;
                            s1 = storm_c53();
                        }
                        s0 = s1;
                        if (s0 === storm_FAILED) {
                            s0 = storm_currPos;
                            if (input.substr(storm_currPos, 2) === storm_c54) {
                                s1 = storm_c54;
                                storm_currPos += 2;
                            } else {
                                s1 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c55); }
                            }
                            if (s1 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c56();
                            }
                            s0 = s1;
                            if (s0 === storm_FAILED) {
                                s0 = storm_currPos;
                                if (input.substr(storm_currPos, 2) === storm_c57) {
                                    s1 = storm_c57;
                                    storm_currPos += 2;
                                } else {
                                    s1 = storm_FAILED;
                                    if (storm_silentFails === 0) { storm_fail(storm_c58); }
                                }
                                if (s1 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c59();
                                }
                                s0 = s1;
                                if (s0 === storm_FAILED) {
                                    s0 = storm_currPos;
                                    if (input.substr(storm_currPos, 2) === storm_c60) {
                                        s1 = storm_c60;
                                        storm_currPos += 2;
                                    } else {
                                        s1 = storm_FAILED;
                                        if (storm_silentFails === 0) { storm_fail(storm_c61); }
                                    }
                                    if (s1 !== storm_FAILED) {
                                        storm_reportedPos = s0;
                                        s1 = storm_c62();
                                    }
                                    s0 = s1;
                                    if (s0 === storm_FAILED) {
                                        s0 = storm_currPos;
                                        if (input.substr(storm_currPos, 2) === storm_c63) {
                                            s1 = storm_c63;
                                            storm_currPos += 2;
                                        } else {
                                            s1 = storm_FAILED;
                                            if (storm_silentFails === 0) { storm_fail(storm_c64); }
                                        }
                                        if (s1 !== storm_FAILED) {
                                            storm_reportedPos = s0;
                                            s1 = storm_c65();
                                        }
                                        s0 = s1;
                                        if (s0 === storm_FAILED) {
                                            s0 = storm_currPos;
                                            if (input.substr(storm_currPos, 2) === storm_c66) {
                                                s1 = storm_c66;
                                                storm_currPos += 2;
                                            } else {
                                                s1 = storm_FAILED;
                                                if (storm_silentFails === 0) { storm_fail(storm_c67); }
                                            }
                                            if (s1 !== storm_FAILED) {
                                                storm_reportedPos = s0;
                                                s1 = storm_c68();
                                            }
                                            s0 = s1;
                                            if (s0 === storm_FAILED) {
                                                s0 = storm_currPos;
                                                if (input.substr(storm_currPos, 2) === storm_c69) {
                                                    s1 = storm_c69;
                                                    storm_currPos += 2;
                                                } else {
                                                    s1 = storm_FAILED;
                                                    if (storm_silentFails === 0) { storm_fail(storm_c70); }
                                                }
                                                if (s1 !== storm_FAILED) {
                                                    s2 = storm_parsehexDigit();
                                                    if (s2 !== storm_FAILED) {
                                                        s3 = storm_parsehexDigit();
                                                        if (s3 !== storm_FAILED) {
                                                            s4 = storm_parsehexDigit();
                                                            if (s4 !== storm_FAILED) {
                                                                s5 = storm_parsehexDigit();
                                                                if (s5 !== storm_FAILED) {
                                                                    storm_reportedPos = s0;
                                                                    s1 = storm_c71(s2, s3, s4, s5);
                                                                    s0 = s1;
                                                                } else {
                                                                    storm_currPos = s0;
                                                                    s0 = storm_c0;
                                                                }
                                                            } else {
                                                                storm_currPos = s0;
                                                                s0 = storm_c0;
                                                            }
                                                        } else {
                                                            storm_currPos = s0;
                                                            s0 = storm_c0;
                                                        }
                                                    } else {
                                                        storm_currPos = s0;
                                                        s0 = storm_c0;
                                                    }
                                                } else {
                                                    storm_currPos = s0;
                                                    s0 = storm_c0;
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

        function storm_parsekey() {
            var s0, s1, s2;

            storm_silentFails++;
            s0 = storm_parsestring();
            if (s0 === storm_FAILED) {
                s0 = storm_parsesingle();
                if (s0 === storm_FAILED) {
                    s0 = storm_currPos;
                    s1 = [];
                    if (storm_c78.test(input.charAt(storm_currPos))) {
                        s2 = input.charAt(storm_currPos);
                        storm_currPos++;
                    } else {
                        s2 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c79); }
                    }
                    if (s2 !== storm_FAILED) {
                        while (s2 !== storm_FAILED) {
                            s1.push(s2);
                            if (storm_c78.test(input.charAt(storm_currPos))) {
                                s2 = input.charAt(storm_currPos);
                                storm_currPos++;
                            } else {
                                s2 = storm_FAILED;
                                if (storm_silentFails === 0) { storm_fail(storm_c79); }
                            }
                        }
                    } else {
                        s1 = storm_c0;
                    }
                    if (s1 !== storm_FAILED) {
                        storm_reportedPos = s0;
                        s1 = storm_c80(s1);
                    }
                    s0 = s1;
                }
            }
            storm_silentFails--;
            if (s0 === storm_FAILED) {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c77); }
            }

            return s0;
        }

        function storm_parseliteral() {
            var s0, s1;

            s0 = [];
            s1 = storm_parselitchar();
            if (s1 !== storm_FAILED) {
                while (s1 !== storm_FAILED) {
                    s0.push(s1);
                    s1 = storm_parselitchar();
                }
            } else {
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parselitchar() {
            var s0;

            if (storm_c81.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c82); }
            }

            return s0;
        }

        function storm_parsenumber() {
            var s0, s1, s2, s3, s4, s5, s6;

            storm_silentFails++;
            s0 = storm_currPos;
            s1 = storm_parseint();
            if (s1 !== storm_FAILED) {
                s2 = storm_parsefrac();
                if (s2 !== storm_FAILED) {
                    s3 = storm_parseexp();
                    if (s3 !== storm_FAILED) {
                        s4 = storm_parse_();
                        if (s4 !== storm_FAILED) {
                            s5 = [];
                            s6 = storm_parselitchar();
                            while (s6 !== storm_FAILED) {
                                s5.push(s6);
                                s6 = storm_parselitchar();
                            }
                            if (s5 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c84(s1, s2, s3, s5);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_currPos;
                s1 = storm_parseint();
                if (s1 !== storm_FAILED) {
                    s2 = storm_parsefrac();
                    if (s2 !== storm_FAILED) {
                        s3 = storm_parse_();
                        if (s3 !== storm_FAILED) {
                            s4 = [];
                            s5 = storm_parselitchar();
                            while (s5 !== storm_FAILED) {
                                s4.push(s5);
                                s5 = storm_parselitchar();
                            }
                            if (s4 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c85(s1, s2, s4);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
                if (s0 === storm_FAILED) {
                    s0 = storm_currPos;
                    s1 = storm_parseint();
                    if (s1 !== storm_FAILED) {
                        s2 = storm_parseexp();
                        if (s2 !== storm_FAILED) {
                            s3 = storm_parse_();
                            if (s3 !== storm_FAILED) {
                                s4 = [];
                                s5 = storm_parselitchar();
                                while (s5 !== storm_FAILED) {
                                    s4.push(s5);
                                    s5 = storm_parselitchar();
                                }
                                if (s4 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c86(s1, s2, s4);
                                    s0 = s1;
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                    if (s0 === storm_FAILED) {
                        s0 = storm_currPos;
                        s1 = storm_parseint();
                        if (s1 !== storm_FAILED) {
                            s2 = storm_parse_();
                            if (s2 !== storm_FAILED) {
                                s3 = [];
                                s4 = storm_parselitchar();
                                while (s4 !== storm_FAILED) {
                                    s3.push(s4);
                                    s4 = storm_parselitchar();
                                }
                                if (s3 !== storm_FAILED) {
                                    storm_reportedPos = s0;
                                    s1 = storm_c87(s1, s3);
                                    s0 = s1;
                                } else {
                                    storm_currPos = s0;
                                    s0 = storm_c0;
                                }
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    }
                }
            }
            storm_silentFails--;
            if (s0 === storm_FAILED) {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c83); }
            }

            return s0;
        }

        function storm_parseint() {
            var s0, s1, s2, s3;

            s0 = storm_currPos;
            s1 = storm_parsedigit19();
            if (s1 !== storm_FAILED) {
                s2 = storm_parsedigits();
                if (s2 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c88(s1, s2);
                    s0 = s1;
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }
            if (s0 === storm_FAILED) {
                s0 = storm_parsedigit();
                if (s0 === storm_FAILED) {
                    s0 = storm_currPos;
                    if (input.charCodeAt(storm_currPos) === 45) {
                        s1 = storm_c89;
                        storm_currPos++;
                    } else {
                        s1 = storm_FAILED;
                        if (storm_silentFails === 0) { storm_fail(storm_c90); }
                    }
                    if (s1 !== storm_FAILED) {
                        s2 = storm_parsedigit19();
                        if (s2 !== storm_FAILED) {
                            s3 = storm_parsedigits();
                            if (s3 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c91(s2, s3);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    } else {
                        storm_currPos = s0;
                        s0 = storm_c0;
                    }
                    if (s0 === storm_FAILED) {
                        s0 = storm_currPos;
                        if (input.charCodeAt(storm_currPos) === 45) {
                            s1 = storm_c89;
                            storm_currPos++;
                        } else {
                            s1 = storm_FAILED;
                            if (storm_silentFails === 0) { storm_fail(storm_c90); }
                        }
                        if (s1 !== storm_FAILED) {
                            s2 = storm_parsedigit();
                            if (s2 !== storm_FAILED) {
                                storm_reportedPos = s0;
                                s1 = storm_c92(s2);
                                s0 = s1;
                            } else {
                                storm_currPos = s0;
                                s0 = storm_c0;
                            }
                        } else {
                            storm_currPos = s0;
                            s0 = storm_c0;
                        }
                    }
                }
            }

            return s0;
        }

        function storm_parsefrac() {
            var s0, s1, s2;

            s0 = storm_currPos;
            if (input.charCodeAt(storm_currPos) === 46) {
                s1 = storm_c93;
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c94); }
            }
            if (s1 !== storm_FAILED) {
                s2 = storm_parsedigits();
                if (s2 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c95(s2);
                    s0 = s1;
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parseexp() {
            var s0, s1, s2;

            s0 = storm_currPos;
            s1 = storm_parsee();
            if (s1 !== storm_FAILED) {
                s2 = storm_parsedigits();
                if (s2 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c96(s1, s2);
                    s0 = s1;
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parsedigits() {
            var s0, s1, s2;

            s0 = storm_currPos;
            s1 = [];
            s2 = storm_parsedigit();
            if (s2 !== storm_FAILED) {
                while (s2 !== storm_FAILED) {
                    s1.push(s2);
                    s2 = storm_parsedigit();
                }
            } else {
                s1 = storm_c0;
            }
            if (s1 !== storm_FAILED) {
                storm_reportedPos = s0;
                s1 = storm_c97(s1);
            }
            s0 = s1;

            return s0;
        }

        function storm_parsee() {
            var s0, s1, s2;

            s0 = storm_currPos;
            if (storm_c98.test(input.charAt(storm_currPos))) {
                s1 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c99); }
            }
            if (s1 !== storm_FAILED) {
                if (storm_c100.test(input.charAt(storm_currPos))) {
                    s2 = input.charAt(storm_currPos);
                    storm_currPos++;
                } else {
                    s2 = storm_FAILED;
                    if (storm_silentFails === 0) { storm_fail(storm_c101); }
                }
                if (s2 === storm_FAILED) {
                    s2 = storm_c9;
                }
                if (s2 !== storm_FAILED) {
                    storm_reportedPos = s0;
                    s1 = storm_c102(s1, s2);
                    s0 = s1;
                } else {
                    storm_currPos = s0;
                    s0 = storm_c0;
                }
            } else {
                storm_currPos = s0;
                s0 = storm_c0;
            }

            return s0;
        }

        function storm_parsedigit() {
            var s0;

            if (storm_c103.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c104); }
            }

            return s0;
        }

        function storm_parsedigit19() {
            var s0;

            if (storm_c105.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c106); }
            }

            return s0;
        }

        function storm_parsehexDigit() {
            var s0;

            if (storm_c107.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c108); }
            }

            return s0;
        }

        function storm_parse_() {
            var s0, s1;

            storm_silentFails++;
            s0 = [];
            s1 = storm_parsewhitespace();
            while (s1 !== storm_FAILED) {
                s0.push(s1);
                s1 = storm_parsewhitespace();
            }
            storm_silentFails--;
            if (s0 === storm_FAILED) {
                s1 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c109); }
            }

            return s0;
        }

        function storm_parsewhitespace() {
            var s0;

            if (storm_c110.test(input.charAt(storm_currPos))) {
                s0 = input.charAt(storm_currPos);
                storm_currPos++;
            } else {
                s0 = storm_FAILED;
                if (storm_silentFails === 0) { storm_fail(storm_c111); }
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


        storm_result = storm_startRuleFunction();

        if (storm_result !== storm_FAILED && storm_currPos === input.length) {
            return storm_result;
        } else {
            if (storm_result !== storm_FAILED && storm_currPos < input.length) {
                storm_fail({ type: "end", description: "end of input" });
            }

            throw storm_buildException(null, storm_maxFailExpected, storm_maxFailPos);
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