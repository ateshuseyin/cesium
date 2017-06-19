/*global define*/
// © 2016 and later: Unicode, Inc. and others.
// License & terms of use: http://www.unicode.org/copyright.html#License
/*
*******************************************************************************
*   Copyright (C) 2001-2012, International Business Machines
*   Corporation and others.  All Rights Reserved.
*******************************************************************************
*/

/*
 * Ported with minor modifications from ICU4J 4.2's
 * com.ibm.icu.text.ArabicShaping class.
 */

define([
        '../Core/defined',
        '../Core/DeveloperError'
    ], function(
        defined,
        DeveloperError) {
    'use strict';

    /**
     * some constants
     */
    var HAMZAFE_CHAR = 0xfe80;
    var HAMZA06_CHAR = 0x0621;
    var YEH_HAMZA_CHAR = 0x0626;
    var YEH_HAMZAFE_CHAR = 0xFE89;
    var LAMALEF_SPACE_SUB = 0xffff;
    var TASHKEEL_SPACE_SUB = 0xfffe;
    var LAM_CHAR = 0x0644;
    var SPACE_CHAR = 0x0020;
    var SPACE_CHAR_FOR_LAMALEF = 0xfeff; // XXX: tweak for TextLine use
    var SHADDA_CHAR = 0xFE7C;
    var TATWEEL_CHAR = 0x0640;
    var SHADDA_TATWEEL_CHAR = 0xFE7D;
    var NEW_TAIL_CHAR = 0xFE73;
    var OLD_TAIL_CHAR = 0x200B;
    var SHAPE_MODE = 0;
    var DESHAPE_MODE = 1;

    ///CLOVER:ON
    //
    // ported api
    //
    var IRRELEVANT = 4;
    var LAMTYPE = 16;
    var ALEFTYPE = 32;
    var LINKR = 1;
    var LINKL = 2;
    var LINK_MASK = 3;
    var irrelevantPos = [0x0, 0x2, 0x4, 0x6, 0x8, 0xA, 0xC, 0xE];

    var tailFamilyIsolatedFinal = [
        /* FEB1 */ 1,
        /* FEB2 */ 1,
        /* FEB3 */ 0,
        /* FEB4 */ 0,
        /* FEB5 */ 1,
        /* FEB6 */ 1,
        /* FEB7 */ 0,
        /* FEB8 */ 0,
        /* FEB9 */ 1,
        /* FEBA */ 1,
        /* FEBB */ 0,
        /* FEBC */ 0,
        /* FEBD */ 1,
        /* FEBE */ 1
    ];

    var tashkeelMedial = [
        /* FE70 */ 0,
        /* FE71 */ 1,
        /* FE72 */ 0,
        /* FE73 */ 0,
        /* FE74 */ 0,
        /* FE75 */ 0,
        /* FE76 */ 0,
        /* FE77 */ 1,
        /* FE78 */ 0,
        /* FE79 */ 1,
        /* FE7A */ 0,
        /* FE7B */ 1,
        /* FE7C */ 0,
        /* FE7D */ 1,
        /* FE7E */ 0,
        /* FE7F */ 1
    ];

    var yehHamzaToYeh = [
        /* isolated*/ 0xFEEF,
        /* final   */ 0xFEF0
    ];

    var convertNormalizedLamAlef = [
        0x0622, // 065C
        0x0623, // 065D
        0x0625, // 065E
        0x0627, // 065F
    ];

    var araLink = [
        1 + 32 + 256 * 0x11,  /*0x0622*/
        1 + 32 + 256 * 0x13,  /*0x0623*/
        1 + 256 * 0x15,  /*0x0624*/
        1 + 32 + 256 * 0x17,  /*0x0625*/
        1 + 2 + 256 * 0x19,  /*0x0626*/
        1 + 32 + 256 * 0x1D,  /*0x0627*/
        1 + 2 + 256 * 0x1F,  /*0x0628*/
        1 + 256 * 0x23,  /*0x0629*/
        1 + 2 + 256 * 0x25,  /*0x062A*/
        1 + 2 + 256 * 0x29,  /*0x062B*/
        1 + 2 + 256 * 0x2D,  /*0x062C*/
        1 + 2 + 256 * 0x31,  /*0x062D*/
        1 + 2 + 256 * 0x35,  /*0x062E*/
        1 + 256 * 0x39,  /*0x062F*/
        1 + 256 * 0x3B,  /*0x0630*/
        1 + 256 * 0x3D,  /*0x0631*/
        1 + 256 * 0x3F,  /*0x0632*/
        1 + 2 + 256 * 0x41,  /*0x0633*/
        1 + 2 + 256 * 0x45,  /*0x0634*/
        1 + 2 + 256 * 0x49,  /*0x0635*/
        1 + 2 + 256 * 0x4D,  /*0x0636*/
        1 + 2 + 256 * 0x51,  /*0x0637*/
        1 + 2 + 256 * 0x55,  /*0x0638*/
        1 + 2 + 256 * 0x59,  /*0x0639*/
        1 + 2 + 256 * 0x5D,  /*0x063A*/
        0, 0, 0, 0, 0,                  /*0x063B-0x063F*/
        1 + 2,                          /*0x0640*/
        1 + 2 + 256 * 0x61,  /*0x0641*/
        1 + 2 + 256 * 0x65,  /*0x0642*/
        1 + 2 + 256 * 0x69,  /*0x0643*/
        1 + 2 + 16 + 256 * 0x6D,  /*0x0644*/
        1 + 2 + 256 * 0x71,  /*0x0645*/
        1 + 2 + 256 * 0x75,  /*0x0646*/
        1 + 2 + 256 * 0x79,  /*0x0647*/
        1 + 256 * 0x7D,  /*0x0648*/
        1 + 256 * 0x7F,  /*0x0649*/
        1 + 2 + 256 * 0x81,  /*0x064A*/
        4, 4, 4, 4,                     /*0x064B-0x064E*/
        4, 4, 4, 4,                     /*0x064F-0x0652*/
        4, 4, 4, 0, 0,                  /*0x0653-0x0657*/
        0, 0, 0, 0,                     /*0x0658-0x065B*/
        1 + 256 * 0x85,  /*0x065C*/
        1 + 256 * 0x87,  /*0x065D*/
        1 + 256 * 0x89,  /*0x065E*/
        1 + 256 * 0x8B,  /*0x065F*/
        0, 0, 0, 0, 0,                  /*0x0660-0x0664*/
        0, 0, 0, 0, 0,                  /*0x0665-0x0669*/
        0, 0, 0, 0, 0, 0,               /*0x066A-0x066F*/
        4,                              /*0x0670*/
        0,                              /*0x0671*/
        1 + 32,               /*0x0672*/
        1 + 32,               /*0x0673*/
        0,                              /*0x0674*/
        1 + 32,               /*0x0675*/
        1, 1,                           /*0x0676-0x0677*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x0678-0x067D*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x067E-0x0683*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,             /*0x0684-0x0687*/
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,   /*0x0688-0x0691*/
        1, 1, 1, 1, 1, 1, 1, 1,         /*0x0692-0x0699*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x069A-0x06A3*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,             /*0x069A-0x06A3*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x06A4-0x06AD*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,             /*0x06A4-0x06AD*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x06AE-0x06B7*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,             /*0x06AE-0x06B7*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2,   /*0x06B8-0x06BF*/
        1 + 2, 1 + 2,                       /*0x06B8-0x06BF*/
        1,                              /*0x06C0*/
        1 + 2,                            /*0x06C1*/
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,   /*0x06C2-0x06CB*/
        1 + 2,                            /*0x06CC*/
        1,                              /*0x06CD*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,             /*0x06CE-0x06D1*/
        1, 1                            /*0x06D2-0x06D3*/
    ];

    var presLink = [
        1 + 2,                        /*0xFE70*/
        1 + 2,                        /*0xFE71*/
        1 + 2, 0, 1 + 2, 0, 1 + 2,      /*0xFE72-0xFE76*/
        1 + 2,                        /*0xFE77*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,      /*0xFE78-0xFE81*/
        1 + 2, 1 + 2, 1 + 2, 1 + 2,      /*0xFE82-0xFE85*/
        0, 0 + 32, 1 + 32, 0 + 32,    /*0xFE86-0xFE89*/
        1 + 32, 0, 1, 0 + 32,        /*0xFE8A-0xFE8D*/
        1 + 32, 0, 2, 1 + 2,         /*0xFE8E-0xFE91*/
        1, 0 + 32, 1 + 32, 0,         /*0xFE92-0xFE95*/
        2, 1 + 2, 1, 0,               /*0xFE96-0xFE99*/
        1, 0, 2, 1 + 2,               /*0xFE9A-0xFE9D*/
        1, 0, 2, 1 + 2,               /*0xFE9E-0xFEA1*/
        1, 0, 2, 1 + 2,               /*0xFEA2-0xFEA5*/
        1, 0, 2, 1 + 2,               /*0xFEA6-0xFEA9*/
        1, 0, 2, 1 + 2,               /*0xFEAA-0xFEAD*/
        1, 0, 1, 0,                   /*0xFEAE-0xFEB1*/
        1, 0, 1, 0,                   /*0xFEB2-0xFEB5*/
        1, 0, 2, 1 + 2,                 /*0xFEB6-0xFEB9*/
        1, 0, 2, 1 + 2,                 /*0xFEBA-0xFEBD*/
        1, 0, 2, 1 + 2,                 /*0xFEBE-0xFEC1*/
        1, 0, 2, 1 + 2,                 /*0xFEC2-0xFEC5*/
        1, 0, 2, 1 + 2,                 /*0xFEC6-0xFEC9*/
        1, 0, 2, 1 + 2,                 /*0xFECA-0xFECD*/
        1, 0, 2, 1 + 2,                 /*0xFECE-0xFED1*/
        1, 0, 2, 1 + 2,                 /*0xFED2-0xFED5*/
        1, 0, 2, 1 + 2,                 /*0xFED6-0xFED9*/
        1, 0, 2, 1 + 2,                 /*0xFEDA-0xFEDD*/
        1, 0, 2, 1 + 2,                 /*0xFEDE-0xFEE1*/
        1, 0 + 16, 2 + 16, 1 + 2 + 16, /*0xFEE2-0xFEE5*/
        1 + 16, 0, 2, 1 + 2,            /*0xFEE6-0xFEE9*/
        1, 0, 2, 1 + 2,                 /*0xFEEA-0xFEED*/
        1, 0, 2, 1 + 2,                 /*0xFEEE-0xFEF1*/
        1, 0, 1, 0,                   /*0xFEF2-0xFEF5*/
        1, 0, 2, 1 + 2,                 /*0xFEF6-0xFEF9*/
        1, 0, 1, 0,                   /*0xFEFA-0xFEFD*/
        1, 0, 1, 0,
        1
    ];

    var convertFEto06 = [
        /***********0******1******2******3******4******5******6******7******8******9******A******B******C******D******E******F***/
        /*FE7*/   0x64B, 0x64B, 0x64C, 0x64C, 0x64D, 0x64D, 0x64E, 0x64E, 0x64F, 0x64F, 0x650, 0x650, 0x651, 0x651, 0x652, 0x652,
        /*FE8*/   0x621, 0x622, 0x622, 0x623, 0x623, 0x624, 0x624, 0x625, 0x625, 0x626, 0x626, 0x626, 0x626, 0x627, 0x627, 0x628,
        /*FE9*/   0x628, 0x628, 0x628, 0x629, 0x629, 0x62A, 0x62A, 0x62A, 0x62A, 0x62B, 0x62B, 0x62B, 0x62B, 0x62C, 0x62C, 0x62C,
        /*FEA*/   0x62C, 0x62D, 0x62D, 0x62D, 0x62D, 0x62E, 0x62E, 0x62E, 0x62E, 0x62F, 0x62F, 0x630, 0x630, 0x631, 0x631, 0x632,
        /*FEB*/   0x632, 0x633, 0x633, 0x633, 0x633, 0x634, 0x634, 0x634, 0x634, 0x635, 0x635, 0x635, 0x635, 0x636, 0x636, 0x636,
        /*FEC*/   0x636, 0x637, 0x637, 0x637, 0x637, 0x638, 0x638, 0x638, 0x638, 0x639, 0x639, 0x639, 0x639, 0x63A, 0x63A, 0x63A,
        /*FED*/   0x63A, 0x641, 0x641, 0x641, 0x641, 0x642, 0x642, 0x642, 0x642, 0x643, 0x643, 0x643, 0x643, 0x644, 0x644, 0x644,
        /*FEE*/   0x644, 0x645, 0x645, 0x645, 0x645, 0x646, 0x646, 0x646, 0x646, 0x647, 0x647, 0x647, 0x647, 0x648, 0x648, 0x649,
        /*FEF*/   0x649, 0x64A, 0x64A, 0x64A, 0x64A, 0x65C, 0x65C, 0x65D, 0x65D, 0x65E, 0x65E, 0x65F, 0x65F
    ];

    var shapeTable = [
        [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 0, 3], [0, 1, 0, 1]],
        [[0, 0, 2, 2], [0, 0, 1, 2], [0, 1, 1, 2], [0, 1, 1, 3]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 0, 3], [0, 1, 0, 3]],
        [[0, 0, 1, 2], [0, 0, 1, 2], [0, 1, 1, 2], [0, 1, 1, 3]]
    ];


    // Strong bidirectional character type "L" in the Unicode specification.
    var DIRECTIONALITY_LEFT_TO_RIGHT = 0;
    // Strong bidirectional character type "R" in the Unicode specification.
    var DIRECTIONALITY_RIGHT_TO_LEFT = 1;
    // Strong bidirectional character type "AL" in the Unicode specification.
    var DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC = 2;
    // Weak bidirectional character type "EN" in the Unicode specification.
    var DIRECTIONALITY_EUROPEAN_NUMBER = 3;

    var CHAR_CODE_0 = '0'.charCodeAt(0);
    var CHAR_CODE_9 = '9'.charCodeAt(0);


    function getDirectionality(ch) {
        if (ch >= 0x0600 && ch <= 0x06FF) {
            return DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC;
        }

        if (ch >= CHAR_CODE_0 && ch <= CHAR_CODE_9) {
            return DIRECTIONALITY_EUROPEAN_NUMBER;
        }

        return DIRECTIONALITY_LEFT_TO_RIGHT;
    }

    /*
     * This function shapes European digits to Arabic-Indic digits
     * in-place, writing over the input characters.  Data is in visual
     * order.
     */
    function shapeToArabicDigitsWithContext(dest, start, length, digitBase, lastStrongWasAL) {
        digitBase -= CHAR_CODE_0; // move common adjustment out of loop
        var i, ch;
        for (i = start + length; --i >= start;) {
            ch = dest[i];
            switch (getDirectionality(ch)) {
                case DIRECTIONALITY_LEFT_TO_RIGHT:
                case DIRECTIONALITY_RIGHT_TO_LEFT:
                    lastStrongWasAL = false;
                    break;
                case DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC:
                    lastStrongWasAL = true;
                    break;
                case DIRECTIONALITY_EUROPEAN_NUMBER:
                    if (lastStrongWasAL && ch <= 0x0039) {
                        dest[i] = ch + digitBase;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    /*
     * Name    : invertBuffer
     * Function: This function inverts the buffer, it's used
     *           in case the user specifies the buffer to be
     *           TEXT_DIRECTION_LOGICAL
     */
    function invertBuffer(buffer, start, length) {
        var temp;
        for (var i = start, j = start + length - 1; i < j; i++ , --j) {
            temp = buffer[i];
            buffer[i] = buffer[j];
            buffer[j] = temp;
        }
    }

    /*
     * Name    : changeLamAlef
     * Function: Converts the Alef characters into an equivalent
     *           LamAlef location in the 0x06xx Range, this is an
     *           intermediate stage in the operation of the program
     *           later it'll be converted into the 0xFExx LamAlefs
     *           in the shaping function.
     */
    function changeLamAlef(ch) {
        switch (ch) {
            case 0x0622: return 0x065C;
            case 0x0623: return 0x065D;
            case 0x0625: return 0x065E;
            case 0x0627: return 0x065F;
            default: return 0x0000; // not a lamalef
        }
    }

    /*
     * Name    : specialChar
     * Function: Special Arabic characters need special handling in the shapeUnicode
     *           function, this function returns 1 or 2 for these special characters
     */
    function specialChar(ch) {
        if ((ch > 0x0621 && ch < 0x0626) ||
            (ch === 0x0627) ||
            (ch > 0x062E && ch < 0x0633) ||
            (ch > 0x0647 && ch < 0x064A) ||
            (ch === 0x0629)) {
            return 1;
        } else if (ch >= 0x064B && ch <= 0x0652) {
            return 2;
        } else if (ch >= 0x0653 && ch <= 0x0655 ||
            ch === 0x0670 ||
            ch >= 0xFE70 && ch <= 0xFE7F) {
            return 3;
        } else {
            return 0;
        }
    }

    /**
     * @private
     * Name    : getLink
     * Function: Resolves the link between the characters as
     *           Arabic characters have four forms :
     *           Isolated, Initial, Middle and Final Form
     * @return {Number}
     */
    function getLink(ch) {
        if (ch >= 0x0622 && ch <= 0x06D3) {
            return araLink[ch - 0x0622];
        } else if (ch === 0x200D) {
            return 3;
        } else if (ch >= 0x206D && ch <= 0x206F) {
            return 4;
        } else if (ch >= 0xFE70 && ch <= 0xFEFC) {
            return presLink[ch - 0xFE70];
        } else {
            return 0;
        }
    }

    /*
     * Name    : countSpaces
     * Function: Counts the number of spaces
     *           at each end of the logical buffer
     */
    function countSpacesLeft(dest, start, count) {
        for (var i = start, e = start + count; i < e; ++i) {
            if (dest[i] !== SPACE_CHAR) {
                return i - start;
            }
        }
        return count;
    }

    function countSpacesRight(dest, start, count) {
        for (var i = start + count; --i >= start;) {
            if (dest[i] !== SPACE_CHAR) {
                return start + count - 1 - i;
            }
        }
        return count;
    }

    /*
     * Name    : isTashkeelChar
     * Function: Returns true for Tashkeel characters else return false
     */
    function isTashkeelChar(ch) {
        return (ch >= 0x064B && ch <= 0x0652);
    }

    /*
   *Name     : isSeenTailFamilyChar
   *Function : returns 1 if the character is a seen family isolated character
   *           in the FE range otherwise returns 0
   */
    function isSeenTailFamilyChar(ch) {
        if (ch >= 0xfeb1 && ch < 0xfebf) {
            return tailFamilyIsolatedFinal[ch - 0xFEB1];
        } else {
            return 0;
        }
    }

    /* Name     : isSeenFamilyChar
     * Function : returns 1 if the character is a seen family character in the Unicode
     *            06 range otherwise returns 0
    */
    function isSeenFamilyChar(ch) {
        if (ch >= 0x633 && ch <= 0x636) {
            return 1;
        } else {
            return 0;
        }
    }

    /*
     *Name     : isTailChar
     *Function : returns true if the character matches one of the tail characters
     *           (0xfe73 or 0x200b) otherwise returns false
     */
    function isTailChar(ch) {
        if (ch === OLD_TAIL_CHAR || ch === NEW_TAIL_CHAR) {
            return true;
        } else {
            return false;
        }
    }

    /*
     *Name     : isAlefMaksouraChar
     *Function : returns true if the character is a Alef Maksoura Final or isolated
     *           otherwise returns false
     */
    function isAlefMaksouraChar(ch) {
        return ((ch === 0xFEEF) || (ch === 0xFEF0) || (ch === 0x0649));
    }

    /*
     * Name     : isYehHamzaChar
     * Function : returns true if the character is a yehHamza isolated or yehhamza
     *            final is found otherwise returns false
     */
    function isYehHamzaChar(ch) {
        if ((ch === 0xFE89) || (ch === 0xFE8A)) {
            return true;
        } else {
            return false;
        }
    }

    /*
     *Name     : isTashkeelCharFE
     *Function : Returns true for Tashkeel characters in FE range else return false
     */
    function isTashkeelCharFE(ch) {
        return (ch !== 0xFE75 && (ch >= 0xFE70 && ch <= 0xFE7F));
    }

    /*
     * Name: isTashkeelOnTatweelChar
     * Function: Checks if the Tashkeel Character is on Tatweel or not,if the
     *           Tashkeel on tatweel (FE range), it returns 1 else if the
     *           Tashkeel with shadda on tatweel (FC range)return 2 otherwise
     *           returns 0
     */
    function isTashkeelOnTatweelChar(ch) {
        if (ch >= 0xfe70 && ch <= 0xfe7f && ch !== NEW_TAIL_CHAR && ch !== 0xFE75 && ch !== SHADDA_TATWEEL_CHAR) {
            return tashkeelMedial[ch - 0xFE70];
        } else if ((ch >= 0xfcf2 && ch <= 0xfcf4) || (ch === SHADDA_TATWEEL_CHAR)) {
            return 2;
        } else {
            return 0;
        }
    }

    /*
     * Name: isIsolatedTashkeelChar
     * Function: Checks if the Tashkeel Character is in the isolated form
     *           (i.e. Unicode FE range) returns 1 else if the Tashkeel
     *           with shadda is in the isolated form (i.e. Unicode FC range)
     *           returns 1 otherwise returns 0
     */
    function isIsolatedTashkeelChar(ch) {
        if (ch >= 0xfe70 && ch <= 0xfe7f && ch !== NEW_TAIL_CHAR && ch !== 0xFE75) {
            return (1 - tashkeelMedial[ch - 0xFE70]);
        } else if (ch >= 0xfc5e && ch <= 0xfc63) {
            return 1;
        } else {
            return 0;
        }
    }

    /*
     * Name    : isAlefChar
     * Function: Returns 1 for Alef characters else return 0
     */
    function isAlefChar(ch) {
        return ch === 0x0622 || ch === 0x0623 || ch === 0x0625 || ch === 0x0627;
    }

    /*
     * Name    : isLamAlefChar
     * Function: Returns true for LamAlef characters else return false
     */
    function isLamAlefChar(ch) {
        return ch >= 0xFEF5 && ch <= 0xFEFC;
    }

    function isNormalizedLamAlefChar(ch) {
        return ch >= 0x065C && ch <= 0x065F;
    }

    /*
     * Name    : calculateSize
     * Function: This function calculates the destSize to be used in preflighting
     *           when the destSize is equal to 0
     */
    function calculateSize(self, source, sourceStart, sourceLength) {
        var destSize = sourceLength;
        var i, e;
        switch (self.options & LETTERS_MASK) {
            case LETTERS_SHAPE:
            case LETTERS_SHAPE_TASHKEEL_ISOLATED:
                if (self.isLogical) {
                    for (i = sourceStart, e = sourceStart + sourceLength - 1; i < e; ++i) {
                        if ((source[i] === LAM_CHAR && isAlefChar(source[i + 1])) || isTashkeelCharFE(source[i])) {
                            --destSize;
                        }
                    }
                } else { // visual
                    for (i = sourceStart + 1, e = sourceStart + sourceLength; i < e; ++i) {
                        if ((source[i] === LAM_CHAR && isAlefChar(source[i - 1])) || isTashkeelCharFE(source[i])) {
                            --destSize;
                        }
                    }
                }
                break;
            case LETTERS_UNSHAPE:
                for (i = sourceStart, e = sourceStart + sourceLength; i < e; ++i) {
                    if (isLamAlefChar(source[i])) {
                        destSize++;
                    }
                }
                break;
            default:
                break;
        }
        return destSize;
    }

    /*
     * Name    : countSpaceSub
     * Function: Counts number of times the subChar appears in the array
     */
    function countSpaceSub(dest, length, subChar) {
        var i = 0;
        var count = 0;
        while (i < length) {
            if (dest[i] === subChar) {
                count++;
            }
            i++;
        }
        return count;
    }

    /*
     * Name    : shiftArray
     * Function: Shifts characters to replace space sub characters
     */
    function shiftArray(dest, start, e, subChar) {
        var w = e;
        var r = e;
        var ch;
        while (--r >= start) {
            ch = dest[r];
            if (ch !== subChar) {
                --w;
                if (w !== r) {
                    dest[w] = ch;
                }
            }
        }
    }

    /*
    * Name    : flipArray
    * Function: inverts array, so that start becomes end and vice versa
    */
    function flipArray(dest, start, e, w) {
        var r;
        if (w > start) {
            // shift, assume small buffer size so don't use arraycopy
            r = w;
            w = start;
            while (r < e) {
                dest[w++] = dest[r++];
            }
        } else {
            w = e;
        }
        return w;
    }

    /*
     * Name     : handleTashkeelWithTatweel
     * Function : Replaces Tashkeel as following:
     *            Case 1 :if the Tashkeel on tatweel, replace it with Tatweel.
     *            Case 2 :if the Tashkeel aggregated with Shadda on Tatweel, replace
     *                   it with Shadda on Tatweel.
     *            Case 3: if the Tashkeel is isolated replace it with Space.
     *
     */
    function handleTashkeelWithTatweel(dest, sourceLength) {
        var i;
        for (i = 0; i < sourceLength; i++) {
            if ((isTashkeelOnTatweelChar(dest[i]) === 1)) {
                dest[i] = TATWEEL_CHAR;
            } else if ((isTashkeelOnTatweelChar(dest[i]) === 2)) {
                dest[i] = SHADDA_TATWEEL_CHAR;
            } else if ((isIsolatedTashkeelChar(dest[i]) === 1) && dest[i] !== SHADDA_CHAR) {
                dest[i] = SPACE_CHAR;
            }
        }
        return sourceLength;
    }

    /*
     * private member function
     *Name     : handleGeneratedSpaces
     *Function : The shapeUnicode function converts Lam + Alef into LamAlef + space,
     *           and Tashkeel to space.
     *           handleGeneratedSpaces function puts these generated spaces
     *           according to the options the user specifies. LamAlef and Tashkeel
     *           spaces can be replaced at begin, at end, at near or decrease the
     *           buffer size.
     *
     *           There is also Auto option for LamAlef and tashkeel, which will put
     *           the spaces at end of the buffer (or end of text if the user used
     *           the option SPACES_RELATIVE_TO_TEXT_BEGIN_END).
     *
     *           If the text type was visual_LTR and the option
     *           SPACES_RELATIVE_TO_TEXT_BEGIN_END was selected the END
     *           option will place the space at the beginning of the buffer and
     *           BEGIN will place the space at the end of the buffer.
     */
    function handleGeneratedSpaces(self, dest, start, length) {
        var lenOptionsLamAlef = self.options & LAMALEF_MASK;
        var lenOptionsTashkeel = self.options & TASHKEEL_MASK;
        var lamAlefOn = false;
        var tashkeelOn = false;
        if (!self.isLogical & !self.spacesRelativeToTextBeginEnd) {
            switch (lenOptionsLamAlef) {
                case LAMALEF_BEGIN: lenOptionsLamAlef = LAMALEF_END; break;
                case LAMALEF_END: lenOptionsLamAlef = LAMALEF_BEGIN; break;
                default: break;
            }
            switch (lenOptionsTashkeel) {
                case TASHKEEL_BEGIN: lenOptionsTashkeel = TASHKEEL_END; break;
                case TASHKEEL_END: lenOptionsTashkeel = TASHKEEL_BEGIN; break;
                default: break;
            }
        }
        if (lenOptionsLamAlef === LAMALEF_NEAR) {
            for (var i = start, e = i + length; i < e; ++i) {
                if (dest[i] === LAMALEF_SPACE_SUB) {
                    dest[i] = SPACE_CHAR_FOR_LAMALEF;
                }
            }
        } else {
            e = start + length;
            var wL = countSpaceSub(dest, length, LAMALEF_SPACE_SUB);
            var wT = countSpaceSub(dest, length, TASHKEEL_SPACE_SUB);
            if (lenOptionsLamAlef === LAMALEF_END) {
                lamAlefOn = true;
            }
            if (lenOptionsTashkeel === TASHKEEL_END) {
                tashkeelOn = true;
            }
            if (lamAlefOn && (lenOptionsLamAlef === LAMALEF_END)) {
                shiftArray(dest, start, e, LAMALEF_SPACE_SUB);
                while (wL > start) {
                    dest[--wL] = SPACE_CHAR;
                }
            }
            if (tashkeelOn && (lenOptionsTashkeel === TASHKEEL_END)) {
                shiftArray(dest, start, e, TASHKEEL_SPACE_SUB);
                while (wT > start) {
                    dest[--wT] = SPACE_CHAR;
                }
            }
            lamAlefOn = false;
            tashkeelOn = false;
            if (lenOptionsLamAlef === LAMALEF_RESIZE) {
                lamAlefOn = true;
            }
            if (lenOptionsTashkeel === TASHKEEL_RESIZE) {
                tashkeelOn = true;
            }
            if (lamAlefOn && (lenOptionsLamAlef === LAMALEF_RESIZE)) {
                shiftArray(dest, start, e, LAMALEF_SPACE_SUB);
                wL = flipArray(dest, start, e, wL);
                length = wL - start;
            }
            if (tashkeelOn && (lenOptionsTashkeel === TASHKEEL_RESIZE)) {
                shiftArray(dest, start, e, TASHKEEL_SPACE_SUB);
                wT = flipArray(dest, start, e, wT);
                length = wT - start;
            }
            lamAlefOn = false;
            tashkeelOn = false;
            if ((lenOptionsLamAlef === LAMALEF_BEGIN) ||
                (lenOptionsLamAlef === LAMALEF_AUTO)) {
                lamAlefOn = true;
            }
            if (lenOptionsTashkeel === TASHKEEL_BEGIN) {
                tashkeelOn = true;
            }
            if (lamAlefOn && ((lenOptionsLamAlef === LAMALEF_BEGIN) ||
                (lenOptionsLamAlef === LAMALEF_AUTO))) { // spaces at beginning
                shiftArray(dest, start, e, LAMALEF_SPACE_SUB);
                wL = flipArray(dest, start, e, wL);
                while (wL < e) {
                    dest[wL++] = SPACE_CHAR;
                }
            }
            if (tashkeelOn && (lenOptionsTashkeel === TASHKEEL_BEGIN)) {
                shiftArray(dest, start, e, TASHKEEL_SPACE_SUB);
                wT = flipArray(dest, start, e, wT);
                while (wT < e) {
                    dest[wT++] = SPACE_CHAR;
                }
            }
        }
        return length;
    }

    /*
     *Name     :expandCompositCharAtBegin
     *Function :Expands the LamAlef character to Lam and Alef consuming the required
     *         space from beginning of the buffer. If the text type was visual_LTR
     *         and the option SPACES_RELATIVE_TO_TEXT_BEGIN_END was selected
     *         the spaces will be located at end of buffer.
     *         If there are no spaces to expand the LamAlef, an exception is thrown.
     */
    function expandCompositCharAtBegin(dest, start, length, lacount) {
        var spaceNotFound = false;
        if (lacount > countSpacesRight(dest, start, length)) {
            spaceNotFound = true;
            return spaceNotFound;
        }
        var ch;
        for (var r = start + length - lacount, w = start + length; --r >= start;) {
            ch = dest[r];
            if (isNormalizedLamAlefChar(ch)) {
                dest[--w] = LAM_CHAR;
                dest[--w] = convertNormalizedLamAlef[ch - 0x065C];
            } else {
                dest[--w] = ch;
            }
        }
        return spaceNotFound;
    }

    /*
    *Name     : expandCompositCharAtEnd
    *Function : Expands the LamAlef character to Lam and Alef consuming the
    *           required space from end of the buffer. If the text type was
    *           Visual LTR and the option SPACES_RELATIVE_TO_TEXT_BEGIN_END
    *           was used, the spaces will be consumed from begin of buffer. If
    *           there are no spaces to expand the LamAlef, an exception is thrown.
    */
    function expandCompositCharAtEnd(dest, start, length, lacount) {
        var spaceNotFound = false;
        if (lacount > countSpacesLeft(dest, start, length)) {
            spaceNotFound = true;
            return spaceNotFound;
        }
        var ch;
        for (var r = start + lacount, w = start, e = start + length; r < e; ++r) {
            ch = dest[r];
            if (isNormalizedLamAlefChar(ch)) {
                dest[w++] = convertNormalizedLamAlef[ch - 0x065C];
                dest[w++] = LAM_CHAR;
            } else {
                dest[w++] = ch;
            }
        }
        return spaceNotFound;
    }

    /*
    *Name     : expandCompositCharAtNear
    *Function : Expands the LamAlef character into Lam + Alef, YehHamza character
    *           into Yeh + Hamza, SeenFamily character into SeenFamily character
    *           + Tail, while consuming the space next to the character.
    */
    function expandCompositCharAtNear(self, dest, start, length, yehHamzaOption, seenTailOption, lamAlefOption) {
        var spaceNotFound = false;
        if (isNormalizedLamAlefChar(dest[start])) {
            spaceNotFound = true;
            return spaceNotFound;
        }
        var ch;
        for (var i = start + length; --i >= start;) {
            ch = dest[i];
            if (lamAlefOption === 1 && isNormalizedLamAlefChar(ch)) {
                if (i > start && dest[i - 1] === SPACE_CHAR) {
                    dest[i] = LAM_CHAR;
                    dest[--i] = convertNormalizedLamAlef[ch - 0x065C];
                } else {
                    spaceNotFound = true;
                    return spaceNotFound;
                }
            } else if (seenTailOption === 1 && isSeenTailFamilyChar(ch) === 1) {
                if (i > start && dest[i - 1] === SPACE_CHAR) {
                    dest[i - 1] = self.tailChar;
                } else {
                    spaceNotFound = true;
                    return spaceNotFound;
                }
            } else if (yehHamzaOption === 1 && isYehHamzaChar(ch)) {
                if (i > start && dest[i - 1] === SPACE_CHAR) {
                    dest[i] = yehHamzaToYeh[ch - YEH_HAMZAFE_CHAR];
                    dest[i - 1] = HAMZAFE_CHAR;
                } else {
                    spaceNotFound = true;
                    return spaceNotFound;
                }
            }
        }
        return false;
    }

    /*
 * Name    : expandCompositChar
 * Function: LamAlef needs special handling as the LamAlef is
 *           one character while expanding it will give two
 *           characters Lam + Alef, so we need to expand the LamAlef
 *           in near or far spaces according to the options the user
 *           specifies or increase the buffer size.
 *           Dest has enough room for the expansion if we are growing.
 *           lamalef are normalized to the 'special characters'
 * @exception
 */
    function expandCompositChar(self, dest, start, length, lacount, shapingMode) {
        var lenOptionsLamAlef = self.options & LAMALEF_MASK;
        var lenOptionsSeen = self.options & SEEN_MASK;
        var lenOptionsYehHamza = self.options & YEHHAMZA_MASK;
        var spaceNotFound = false;
        if (!self.isLogical && !self.spacesRelativeToTextBeginEnd) {
            switch (lenOptionsLamAlef) {
                case LAMALEF_BEGIN: lenOptionsLamAlef = LAMALEF_END; break;
                case LAMALEF_END: lenOptionsLamAlef = LAMALEF_BEGIN; break;
                default: break;
            }
        }
        if (shapingMode === 1) {
            if (lenOptionsLamAlef === LAMALEF_AUTO) {
                if (self.isLogical) {
                    spaceNotFound = expandCompositCharAtEnd(dest, start, length, lacount);
                    if (spaceNotFound) {
                        spaceNotFound = expandCompositCharAtBegin(dest, start, length, lacount);
                    }
                    if (spaceNotFound) {
                        spaceNotFound = expandCompositCharAtNear(dest, start, length, 0, 0, 1);
                    }
                    if (spaceNotFound) {
                        throw new DeveloperError("No spacefor lamalef");
                    }
                } else {
                    spaceNotFound = expandCompositCharAtBegin(dest, start, length, lacount);
                    if (spaceNotFound) {
                        spaceNotFound = expandCompositCharAtEnd(dest, start, length, lacount);
                    }
                    if (spaceNotFound) {
                        spaceNotFound = expandCompositCharAtNear(dest, start, length, 0, 0, 1);
                    }
                    if (spaceNotFound) {
                        throw new DeveloperError("No spacefor lamalef");
                    }
                }
            } else if (lenOptionsLamAlef === LAMALEF_END) {
                spaceNotFound = expandCompositCharAtEnd(dest, start, length, lacount);
                if (spaceNotFound) {
                    throw new DeveloperError("No spacefor lamalef");
                }
            } else if (lenOptionsLamAlef === LAMALEF_BEGIN) {
                spaceNotFound = expandCompositCharAtBegin(dest, start, length, lacount);
                if (spaceNotFound) {
                    throw new DeveloperError("No spacefor lamalef");
                }
            } else if (lenOptionsLamAlef === LAMALEF_NEAR) {
                spaceNotFound = expandCompositCharAtNear(dest, start, length, 0, 0, 1);
                if (spaceNotFound) {
                    throw new DeveloperError("No spacefor lamalef");
                }
            } else if (lenOptionsLamAlef === LAMALEF_RESIZE) {
                var ch;
                for (var r = start + length, w = r + lacount; --r >= start;) {
                    ch = dest[r];
                    if (isNormalizedLamAlefChar(ch)) {
                        dest[--w] = 0x0644;
                        dest[--w] = convertNormalizedLamAlef[ch - 0x065C];
                    } else {
                        dest[--w] = ch;
                    }
                }
                length += lacount;
            }
        } else {
            if (lenOptionsSeen === SEEN_TWOCELL_NEAR) {
                spaceNotFound = expandCompositCharAtNear(dest, start, length, 0, 1, 0);
                if (spaceNotFound) {
                    throw new DeveloperError("No space for Seen tail expansion");
                }
            }
            if (lenOptionsYehHamza === YEHHAMZA_TWOCELL_NEAR) {
                spaceNotFound = expandCompositCharAtNear(dest, start, length, 1, 0, 0);
                if (spaceNotFound) {
                    throw new DeveloperError("No space for YehHamza expansion");
                }
            }
        }
        return length;
    }

    /* Convert the input buffer from FExx Range into 06xx Range
    * to put all characters into the 06xx range
    * even the lamalef is converted to the special region in
    * the 06xx range.  Return the number of lamalef chars found.
    */
    function normalize(dest, start, length) {
        var lacount = 0;
        var ch;
        for (var i = start, e = i + length; i < e; ++i) {
            ch = dest[i];
            if (ch >= 0xFE70 && ch <= 0xFEFC) {
                if (isLamAlefChar(ch)) {
                    ++lacount;
                }
                dest[i] = convertFEto06[ch - 0xFE70];  //TODO
            }
        }
        return lacount;
    }

    /*
     * Name    : deshapeNormalize
     * Function: Convert the input buffer from FExx Range into 06xx Range
     *           even the lamalef is converted to the special region in the 06xx range.
     *           According to the options the user enters, all seen family characters
     *           followed by a tail character are merged to seen tail family character and
     *           any yeh followed by a hamza character are merged to yehhamza character.
     *           Method returns the number of lamalef chars found.
     */
    function deshapeNormalize(self, dest, start, length) {
        var lacount = 0;
        var yehHamzaComposeEnabled = 0;
        var seenComposeEnabled = 0;
        yehHamzaComposeEnabled = ((self.options & YEHHAMZA_MASK) === YEHHAMZA_TWOCELL_NEAR) ? 1 : 0;
        seenComposeEnabled = ((self.options & SEEN_MASK) === SEEN_TWOCELL_NEAR) ? 1 : 0;
        var ch;
        for (var i = start, e = i + length; i < e; ++i) {
            ch = dest[i];
            if ((yehHamzaComposeEnabled === 1) && ((ch === HAMZA06_CHAR) || (ch === HAMZAFE_CHAR))
                && (i < (length - 1)) && isAlefMaksouraChar(dest[i + 1])) {
                dest[i] = SPACE_CHAR;
                dest[i + 1] = YEH_HAMZA_CHAR;
            } else if ((seenComposeEnabled === 1) && (isTailChar(ch)) && (i < (length - 1))
                && (isSeenTailFamilyChar(dest[i + 1]) === 1)) {
                dest[i] = SPACE_CHAR;
            }
            else if (ch >= 0xFE70 && ch <= 0xFEFC) {
                if (isLamAlefChar(ch)) {
                    ++lacount;
                }
                dest[i] = convertFEto06[ch - 0xFE70];
            }
        }
        return lacount;
    }

    /*
    * Name    : shapeUnicode
    * Function: Converts an Arabic Unicode buffer in 06xx Range into a shaped
    *           arabic Unicode buffer in FExx Range
    */
    function shapeUnicode(self, dest, start, length, destSize, tashkeelFlag) {
        var lamalef_count = normalize(dest, start, length);
        // resolve the link between the characters.
        // Arabic characters have four forms: Isolated, Initial, Medial and Final.
        // Tashkeel characters have two, isolated or medial, and sometimes only isolated.
        // tashkeelFlag === 0: shape normally, 1: shape isolated, 2: don't shape
        var lamalef_found = false, seenfam_found = false;
        var yehhamza_found = false, tashkeel_found = false;
        var i = start + length - 1;
        var currLink = getLink(dest[i]);
        var nextLink = 0;
        var prevLink = 0;
        var lastLink = 0;
        //int prevPos = i;
        var lastPos = i;
        var nx = -2;
        var nw = 0;
        while (i >= 0) {
            // If high byte of currLink > 0 then there might be more than one shape
            if ((currLink & 0xFF00) > 0 || isTashkeelChar(dest[i])) {
                nw = i - 1;
                nx = -2;
                while (nx < 0) { // we need to know about next char
                    if (nw === -1) {
                        nextLink = 0;
                        nx = Number.MAX_SAFE_INTEGER;
                    } else {
                        nextLink = getLink(dest[nw]);
                        if ((nextLink & IRRELEVANT) === 0) {
                            nx = nw;
                        } else {
                            --nw;
                        }
                    }
                }
                if (((currLink & ALEFTYPE) > 0) && ((lastLink & LAMTYPE) > 0)) {
                    lamalef_found = true;
                    var wLamalef = changeLamAlef(dest[i]); // get from 0x065C-0x065f
                    if (wLamalef !== 0x0000) {
                        // replace alef by marker, it will be removed later
                        dest[i] = 0xffff;
                        dest[lastPos] = wLamalef;
                        i = lastPos;
                    }
                    lastLink = prevLink;
                    currLink = getLink(wLamalef); // requires '\u0000', unfortunately
                }
                if ((i > 0) && (dest[i - 1] === SPACE_CHAR)) {
                    if (isSeenFamilyChar(dest[i]) === 1) {
                        seenfam_found = true;
                    } else if (dest[i] === YEH_HAMZA_CHAR) {
                        yehhamza_found = true;
                    }
                }
                else if (i === 0) {
                    if (isSeenFamilyChar(dest[i]) === 1) {
                        seenfam_found = true;
                    } else if (dest[i] === YEH_HAMZA_CHAR) {
                        yehhamza_found = true;
                    }
                }
                // get the proper shape according to link ability of neighbors
                // and of character; depends on the order of the shapes
                // (isolated, initial, middle, final) in the compatibility area
                var flag = specialChar(dest[i]);
                var shape = shapeTable[nextLink & LINK_MASK][lastLink & LINK_MASK][currLink & LINK_MASK];
                if (flag === 1) {
                    shape &= 0x1;
                } else if (flag === 2) {
                    if (tashkeelFlag === 0 &&
                        ((lastLink & LINKL) !== 0) &&
                        ((nextLink & LINKR) !== 0) &&
                        dest[i] !== 0x064C &&
                        dest[i] !== 0x064D &&
                        !((nextLink & ALEFTYPE) === ALEFTYPE &&
                            (lastLink & LAMTYPE) === LAMTYPE)) {
                        shape = 1;
                    } else {
                        shape = 0;
                    }
                }
                if (flag === 2) {
                    if (tashkeelFlag === 2) {
                        dest[i] = TASHKEEL_SPACE_SUB;
                        tashkeel_found = true;
                    }
                    else {
                        dest[i] = (0xFE70 + irrelevantPos[dest[i] - 0x064B] + shape);
                    }
                    // else leave tashkeel alone
                } else {
                    dest[i] = (0xFE70 + (currLink >> 8) + shape);
                }
            }
            // move one notch forward
            if ((currLink & IRRELEVANT) === 0) {
                prevLink = lastLink;
                lastLink = currLink;
                //prevPos = lastPos;
                lastPos = i;
            }
            --i;
            if (i === nx) {
                currLink = nextLink;
                nx = -2;
            } else if (i !== -1) {
                currLink = getLink(dest[i]);
            }
        }
        // If we found a lam/alef pair in the buffer
        // call handleGeneratedSpaces to remove the spaces that were added
        destSize = length;
        if (lamalef_found || tashkeel_found) {
            destSize = handleGeneratedSpaces(self, dest, start, length);
        }
        if (seenfam_found || yehhamza_found) {
            destSize = expandCompositChar(self, dest, start, destSize, lamalef_count, SHAPE_MODE);
        }
        return destSize;
    }

    function arraycopy(src, srcPos, dest, destPos, length) {
        for (var i = 0; i < length; i++) {
            dest[destPos + i] = src[srcPos + i];
        }
    }


    /*
     * Name    : deShapeUnicode
     * Function: Converts an Arabic Unicode buffer in FExx Range into unshaped
     *           arabic Unicode buffer in 06xx Range
     */
    function deShapeUnicode(self, dest, start, length, destSize) {
        var lamalef_count = deshapeNormalize(self, dest, start, length);
        // If there was a lamalef in the buffer call expandLamAlef
        if (lamalef_count !== 0) {
            // need to adjust dest to fit expanded buffer... !!!
            destSize = expandCompositChar(self, dest, start, length, lamalef_count, DESHAPE_MODE);
        } else {
            destSize = length;
        }
        return destSize;
    }

    function internalShape(self, source, sourceStart, sourceLength, dest, destStart, destSize) {
        if (sourceLength === 0) {
            return 0;
        }
        if (destSize === 0) {
            if (((self.options & LETTERS_MASK) !== LETTERS_NOOP) &&
                ((self.options & LAMALEF_MASK) === LAMALEF_RESIZE)) {
                return calculateSize(self, source, sourceStart, sourceLength);
            } else {
                return sourceLength; // by definition
            }
        }
        // always use temp buffer
        var temp = new Array(sourceLength * 2); // all lamalefs requiring expansion
        arraycopy(source, sourceStart, temp, 0, sourceLength);

        if (self.isLogical) {
            invertBuffer(temp, 0, sourceLength);
        }
        var outputSize = sourceLength;
        var i, ch, digitDelta;
        switch (self.options & LETTERS_MASK) {
            case LETTERS_SHAPE_TASHKEEL_ISOLATED:
                outputSize = shapeUnicode(self, temp, 0, sourceLength, destSize, 1);
                break;
            case LETTERS_SHAPE:
                if (((self.options & TASHKEEL_MASK) > 0) &&
                    ((self.options & TASHKEEL_MASK) !== TASHKEEL_REPLACE_BY_TATWEEL)) {
                    /* Call the shaping function with tashkeel flag === 2 for removal of tashkeel */
                    outputSize = shapeUnicode(self, temp, 0, sourceLength, destSize, 2);
                } else {
                    //default Call the shaping function with tashkeel flag === 1 */
                    outputSize = shapeUnicode(self, temp, 0, sourceLength, destSize, 0);
                    /*After shaping text check if user wants to remove tashkeel and replace it with tatweel*/
                    if ((self.options & TASHKEEL_MASK) === TASHKEEL_REPLACE_BY_TATWEEL) {
                        outputSize = handleTashkeelWithTatweel(temp, sourceLength);
                    }
                }
                break;
            case LETTERS_UNSHAPE:
                outputSize = deShapeUnicode(self, temp, 0, sourceLength, destSize);
                break;
            default:
                break;
        }
        if (outputSize > destSize) {
            throw new DeveloperError("not enough room for result data");
        }
        if ((self.options & DIGITS_MASK) !== DIGITS_NOOP) {
            var digitBase = 0x0030; // European digits
            switch (self.options & DIGIT_TYPE_MASK) {
                case DIGIT_TYPE_AN:
                    digitBase = 0x0660;  // Arabic-Indic digits
                    break;
                case DIGIT_TYPE_AN_EXTENDED:
                    digitBase = 0x06f0;  // Eastern Arabic-Indic digits (Persian and Urdu)
                    break;
                default:
                    break;
            }
            switch (self.options & DIGITS_MASK) {
                case DIGITS_EN2AN:
                    digitDelta = digitBase - 0x0030;
                    for (i = 0; i < outputSize; ++i) {
                        ch = temp[i];
                        if (ch <= 0x0039 && ch >= 0x0030) {
                            temp[i] += digitDelta;
                        }
                    }
                    break;
                case DIGITS_AN2EN:
                    var digitTop = digitBase + 9;
                    digitDelta = 0x0030 - digitBase;
                    for (i = 0; i < outputSize; ++i) {
                        ch = temp[i];
                        if (ch <= digitTop && ch >= digitBase) {
                            temp[i] += digitDelta;
                        }
                    }
                    break;
                case DIGITS_EN2AN_INIT_LR:
                    shapeToArabicDigitsWithContext(temp, 0, outputSize, digitBase, false);
                    break;
                case DIGITS_EN2AN_INIT_AL:
                    shapeToArabicDigitsWithContext(temp, 0, outputSize, digitBase, true);
                    break;
                default:
                    break;
            }
        }
        if (self.isLogical) {
            invertBuffer(temp, 0, outputSize);
        }
        arraycopy(temp, 0, dest, destStart, outputSize);
        return outputSize;
    }



    /**
     * Shape Arabic text on a character basis.
     *
     * <p>ArabicShaping performs basic operations for "shaping" Arabic text. It is most
     * useful for use with legacy data formats and legacy display technology
     * (simple terminals). All operations are performed on Unicode characters.</p>
     *
     * <p>Text-based shaping means that some character code points in the text are
     * replaced by others depending on the context. It transforms one kind of text
     * into another. In comparison, modern displays for Arabic text select
     * appropriate, context-dependent font glyphs for each text element, which means
     * that they transform text into a glyph vector.</p>
     *
     * <p>Text transformations are necessary when modern display technology is not
     * available or when text needs to be transformed to or from legacy formats that
     * use "shaped" characters. Since the Arabic script is cursive, connecting
     * adjacent letters to each other, computers select images for each letter based
     * on the surrounding letters. This usually results in four images per Arabic
     * letter: initial, middle, final, and isolated forms. In Unicode, on the other
     * hand, letters are normally stored abstract, and a display system is expected
     * to select the necessary glyphs. (This makes searching and other text
     * processing easier because the same letter has only one code.) It is possible
     * to mimic this with text transformations because there are characters in
     * Unicode that are rendered as letters with a specific shape
     * (or cursive connectivity). They were included for interoperability with
     * legacy systems and codepages, and for unsophisticated display systems.</p>
     *
     * <p>A second kind of text transformations is supported for Arabic digits:
     * For compatibility with legacy codepages that only include European digits,
     * it is possible to replace one set of digits by another, changing the
     * character code points. These operations can be performed for either
     * Arabic-Indic Digits (U+0660...U+0669) or Eastern (Extended) Arabic-Indic
     * digits (U+06f0...U+06f9).</p>
     *
     * <p>Some replacements may result in more or fewer characters (code points).
     * By default, this means that the destination buffer may receive text with a
     * length different from the source length. Some legacy systems rely on the
     * length of the text to be constant. They expect extra spaces to be added
     * or consumed either next to the affected character or at the end of the
     * text.</p>
     * @stable ICU 2.0
     *
     * @hide
     */
    function ArabicShaping(options) {
        this._options = options;
    }

    //public static functions
    ArabicShaping.countSpaceSub = countSpaceSub;
    ArabicShaping.shiftArray = shiftArray;

    // public static final members

    var SEEN_TWOCELL_NEAR = 0x200000;
    /**
     * Memory option: the result must have the same length as the source.
     * Shaping mode: The SEEN family character will expand into two characters using space near
     *               the SEEN family character(i.e. the space after the character).
     *               if there are no spaces found, ArabicShapingException will be thrown
     *
     * De-shaping mode: Any Seen character followed by Tail character will be
     *                  replaced by one cell Seen and a space will replace the Tail.
     * Affects: Seen options
     */
    ArabicShaping.SEEN_TWOCELL_NEAR = SEEN_TWOCELL_NEAR;

    var SEEN_MASK = 0x700000;
    /** Bit mask for Seen memory options. */
    ArabicShaping.SEEN_MASK = SEEN_MASK;

    var YEHHAMZA_TWOCELL_NEAR = 0x1000000;
    /* YehHamza options */
    /**
     * Memory option: the result must have the same length as the source.
     * Shaping mode: The YEHHAMZA character will expand into two characters using space near it
     *              (i.e. the space after the character)
     *               if there are no spaces found, ArabicShapingException will be thrown
     *
     * De-shaping mode: Any Yeh (final or isolated) character followed by Hamza character will be
     *                  replaced by one cell YehHamza and space will replace the Hamza.
     * Affects: YehHamza options
     */
    ArabicShaping.YEHHAMZA_TWOCELL_NEAR = YEHHAMZA_TWOCELL_NEAR;

    var YEHHAMZA_MASK = 0x3800000;
    /** Bit mask for YehHamza memory options. */
    ArabicShaping.YEHHAMZA_MASK = YEHHAMZA_MASK;

    var TASHKEEL_BEGIN = 0x40000;
    /* New Tashkeel options */
    /**
     * Memory option: the result must have the same length as the source.
     * Shaping mode: Tashkeel characters will be replaced by spaces.
     *               Spaces will be placed at beginning of the buffer
     *
     * De-shaping mode: N/A
     * Affects: Tashkeel options
     */
    ArabicShaping.TASHKEEL_BEGIN = TASHKEEL_BEGIN;

    var TASHKEEL_END = 0x60000;
    /**
    * Memory option: the result must have the same length as the source.
    * Shaping mode: Tashkeel characters will be replaced by spaces.
    *               Spaces will be placed at end of the buffer
    *
    * De-shaping mode: N/A
    * Affects: Tashkeel options
    */
    ArabicShaping.TASHKEEL_END = TASHKEEL_END;

    var TASHKEEL_RESIZE = 0x80000;
    /**
     * Memory option: allow the result to have a different length than the source.
     * Shaping mode: Tashkeel characters will be removed, buffer length will shrink.
     * De-shaping mode: N/A
     *
     * Affects: Tashkeel options
     */
    ArabicShaping.TASHKEEL_RESIZE = TASHKEEL_RESIZE;

    var TASHKEEL_REPLACE_BY_TATWEEL = 0xC0000;
    /**
     * Memory option: the result must have the same length as the source.
     * Shaping mode: Tashkeel characters will be replaced by Tatweel if it is connected to adjacent
     *               characters (i.e. shaped on Tatweel) or replaced by space if it is not connected.
     *
     * De-shaping mode: N/A
     * Affects: YehHamza options
     */
    ArabicShaping.TASHKEEL_REPLACE_BY_TATWEEL = TASHKEEL_REPLACE_BY_TATWEEL;

    var TASHKEEL_MASK = 0xE0000;
    /** Bit mask for Tashkeel replacement with Space or Tatweel memory options. */
    ArabicShaping.TASHKEEL_MASK = TASHKEEL_MASK;

    var SPACES_RELATIVE_TO_TEXT_BEGIN_END = 0x4000000;
    /* Space location Control options */
    /**
     * This option effects the meaning of BEGIN and END options. if this option is not used the default
     * for BEGIN and END will be as following:
     * The Default (for both Visual LTR, Visual RTL and Logical Text)
     *           1. BEGIN always refers to the start address of physical memory.
     *           2. END always refers to the end address of physical memory.
     *
     * If this option is used it will swap the meaning of BEGIN and END only for Visual LTR text.
     *
     * The affect on BEGIN and END Memory Options will be as following:
     *    A. BEGIN For Visual LTR text: This will be the beginning (right side) of the visual text
     *       (corresponding to the physical memory address end, same as END in default behavior)
     *    B. BEGIN For Logical text: Same as BEGIN in default behavior.
     *    C. END For Visual LTR text: This will be the end (left side) of the visual text. (corresponding to
     *      the physical memory address beginning, same as BEGIN in default behavior)
     *    D. END For Logical text: Same as END in default behavior.
     * Affects: All LamAlef BEGIN, END and AUTO options.
     */
    ArabicShaping.SPACES_RELATIVE_TO_TEXT_BEGIN_END = SPACES_RELATIVE_TO_TEXT_BEGIN_END;

    var SPACES_RELATIVE_TO_TEXT_MASK = 0x4000000;
    /** Bit mask for swapping BEGIN and END for Visual LTR text */
    ArabicShaping.SPACES_RELATIVE_TO_TEXT_MASK = SPACES_RELATIVE_TO_TEXT_MASK;

    var SHAPE_TAIL_NEW_UNICODE = 0x8000000;
    /**
     * If this option is used, shaping will use the new Unicode code point for TAIL (i.e. 0xFE73).
     * If this option is not specified (Default), old unofficial Unicode TAIL code point is used (i.e. 0x200B)
     * De-shaping will not use this option as it will always search for both the new Unicode code point for the
     * TAIL (i.e. 0xFE73) or the old unofficial Unicode TAIL code point (i.e. 0x200B) and de-shape the
     * Seen-Family letter accordingly.
     *
     * Shaping Mode: Only shaping.
     * De-shaping Mode: N/A.
     * Affects: All Seen options
     */
    ArabicShaping.SHAPE_TAIL_NEW_UNICODE = SHAPE_TAIL_NEW_UNICODE;


    var SHAPE_TAIL_TYPE_MASK = 0x8000000;
    /** Bit mask for new Unicode Tail option */
    ArabicShaping.SHAPE_TAIL_TYPE_MASK = SHAPE_TAIL_TYPE_MASK;

    var LENGTH_GROW_SHRINK = 0;
    /**
     * Memory option: allow the result to have a different length than the source.
     * @stable ICU 2.0
     */
    ArabicShaping.LENGTH_GROW_SHRINK = LENGTH_GROW_SHRINK;

    var LAMALEF_RESIZE = 0;
    /**
     * Memory option: allow the result to have a different length than the source.
     * Affects: LamAlef options
     * This option is an alias to LENGTH_GROW_SHRINK
     */
    ArabicShaping.LAMALEF_RESIZE = LAMALEF_RESIZE;

    var LENGTH_FIXED_SPACES_NEAR = 1;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces next to modified characters.
     * @stable ICU 2.0
     */
    ArabicShaping.LENGTH_FIXED_SPACES_NEAR = LENGTH_FIXED_SPACES_NEAR;

    var LAMALEF_NEAR = 1;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces next to modified characters.
     * Affects: LamAlef options
     * This option is an alias to LENGTH_FIXED_SPACES_NEAR
     */
    ArabicShaping.LAMALEF_NEAR = LAMALEF_NEAR;

    var LENGTH_FIXED_SPACES_AT_END = 2;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces at the end of the text.
     * @stable ICU 2.0
     */
    ArabicShaping.LENGTH_FIXED_SPACES_AT_END = LENGTH_FIXED_SPACES_AT_END;

    var LAMALEF_END = 2;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces at the end of the text.
     * Affects: LamAlef options
     * This option is an alias to LENGTH_FIXED_SPACES_AT_END
     */
    ArabicShaping.LAMALEF_END = LAMALEF_END;


    var LENGTH_FIXED_SPACES_AT_BEGINNING = 3;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces at the beginning of the text.
     * @stable ICU 2.0
     */
    ArabicShaping.LENGTH_FIXED_SPACES_AT_BEGINNING = LENGTH_FIXED_SPACES_AT_BEGINNING;

    var LAMALEF_BEGIN = 3;
    /**
     * Memory option: the result must have the same length as the source.
     * If more room is necessary, then try to consume spaces at the beginning of the text.
     * Affects: LamAlef options
     * This option is an alias to LENGTH_FIXED_SPACES_AT_BEGINNING
     */
    ArabicShaping.LAMALEF_BEGIN = LAMALEF_BEGIN;


    var LAMALEF_AUTO = 0x10000;
    /**
     * Memory option: the result must have the same length as the source.
     * Shaping Mode: For each LAMALEF character found, expand LAMALEF using space at end.
     *               If there is no space at end, use spaces at beginning of the buffer. If there
     *               is no space at beginning of the buffer, use spaces at the near (i.e. the space
     *               after the LAMALEF character).
     *
     * Deshaping Mode: Perform the same function as the flag equals LAMALEF_END.
     * Affects: LamAlef options
     */
    ArabicShaping.LAMALEF_AUTO = LAMALEF_AUTO;


    var LENGTH_MASK = 0x10003;
    /**
     * Bit mask for memory options.
     * @stable ICU 2.0
     */
    ArabicShaping.LENGTH_MASK = LENGTH_MASK;


    var LAMALEF_MASK = 0x10003;
    /** Bit mask for LamAlef memory options. */
    ArabicShaping.LAMALEF_MASK = LAMALEF_MASK;


    var TEXT_DIRECTION_LOGICAL = 0;
    /**
     * Direction indicator: the source is in logical (keyboard) order.
     * @stable ICU 2.0
     */
    ArabicShaping.TEXT_DIRECTION_LOGICAL = TEXT_DIRECTION_LOGICAL;


    var TEXT_DIRECTION_VISUAL_RTL = 0;
    /**
     * Direction indicator:the source is in visual RTL order,
     * the rightmost displayed character stored first.
     * This option is an alias to U_SHAPE_TEXT_DIRECTION_LOGICAL
     */
    ArabicShaping.TEXT_DIRECTION_VISUAL_RTL = TEXT_DIRECTION_VISUAL_RTL;


    var TEXT_DIRECTION_VISUAL_LTR = 4;
    /**
     * Direction indicator: the source is in visual (display) order, that is,
     * the leftmost displayed character is stored first.
     * @stable ICU 2.0
     */
    ArabicShaping.TEXT_DIRECTION_VISUAL_LTR = TEXT_DIRECTION_VISUAL_LTR;


    var TEXT_DIRECTION_MASK = 4;
    /**
     * Bit mask for direction indicators.
     * @stable ICU 2.0
     */
    ArabicShaping.TEXT_DIRECTION_MASK = TEXT_DIRECTION_MASK;


    var LETTERS_NOOP = 0;
    /**
     * Letter shaping option: do not perform letter shaping.
     * @stable ICU 2.0
     */
    ArabicShaping.LETTERS_NOOP = LETTERS_NOOP;


    var LETTERS_SHAPE = 8;
    /**
     * Letter shaping option: replace normative letter characters in the U+0600 (Arabic) block,
     * by shaped ones in the U+FE70 (Presentation Forms B) block. Performs Lam-Alef ligature
     * substitution.
     * @stable ICU 2.0
     */
    ArabicShaping.LETTERS_SHAPE = LETTERS_SHAPE;

    var LETTERS_UNSHAPE = 0x10;
    /**
     * Letter shaping option: replace shaped letter characters in the U+FE70 (Presentation Forms B) block
     * by normative ones in the U+0600 (Arabic) block.  Converts Lam-Alef ligatures to pairs of Lam and
     * Alef characters, consuming spaces if required.
     * @stable ICU 2.0
     */
    ArabicShaping.LETTERS_UNSHAPE = LETTERS_UNSHAPE;


    var LETTERS_SHAPE_TASHKEEL_ISOLATED = 0x18;
    /**
     * Letter shaping option: replace normative letter characters in the U+0600 (Arabic) block,
     * except for the TASHKEEL characters at U+064B...U+0652, by shaped ones in the U+Fe70
     * (Presentation Forms B) block.  The TASHKEEL characters will always be converted to
     * the isolated forms rather than to their correct shape.
     * @stable ICU 2.0
     */
    ArabicShaping.LETTERS_SHAPE_TASHKEEL_ISOLATED = LETTERS_SHAPE_TASHKEEL_ISOLATED;

    var LETTERS_MASK = 0x18;
    /**
     * Bit mask for letter shaping options.
     * @stable ICU 2.0
     */
    ArabicShaping.LETTERS_MASK = LETTERS_MASK;


    var DIGITS_NOOP = 0;
    /**
     * Digit shaping option: do not perform digit shaping.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_NOOP = DIGITS_NOOP;


    var DIGITS_EN2AN = 0x20;
    /**
     * Digit shaping option: Replace European digits (U+0030...U+0039) by Arabic-Indic digits.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_EN2AN = DIGITS_EN2AN;


    var DIGITS_AN2EN = 0x40;
    /**
     * Digit shaping option: Replace Arabic-Indic digits by European digits (U+0030...U+0039).
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_AN2EN = DIGITS_AN2EN;


    var DIGITS_EN2AN_INIT_LR = 0x60;
    /**
     * Digit shaping option:
     * Replace European digits (U+0030...U+0039) by Arabic-Indic digits
     * if the most recent strongly directional character
     * is an Arabic letter (its Bidi direction value is RIGHT_TO_LEFT_ARABIC).
     * The initial state at the start of the text is assumed to be not an Arabic,
     * letter, so European digits at the start of the text will not change.
     * Compare to DIGITS_ALEN2AN_INIT_AL.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_EN2AN_INIT_LR = DIGITS_EN2AN_INIT_LR;


    var DIGITS_EN2AN_INIT_AL = 0x80;
    /**
     * Digit shaping option:
     * Replace European digits (U+0030...U+0039) by Arabic-Indic digits
     * if the most recent strongly directional character
     * is an Arabic letter (its Bidi direction value is RIGHT_TO_LEFT_ARABIC).
     * The initial state at the start of the text is assumed to be an Arabic,
     * letter, so European digits at the start of the text will change.
     * Compare to DIGITS_ALEN2AN_INT_LR.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_EN2AN_INIT_AL = DIGITS_EN2AN_INIT_AL;


    var DIGITS_MASK = 0xe0;
    /** Not a valid option value. */
    //private static final int DIGITS_RESERVED = 0xa0;
    /**
     * Bit mask for digit shaping options.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGITS_MASK = DIGITS_MASK;


    var DIGIT_TYPE_AN = 0;
    /**
     * Digit type option: Use Arabic-Indic digits (U+0660...U+0669).
     * @stable ICU 2.0
     */
    ArabicShaping.DIGIT_TYPE_AN = DIGIT_TYPE_AN;


    var DIGIT_TYPE_AN_EXTENDED = 0x100;
    /**
     * Digit type option: Use Eastern (Extended) Arabic-Indic digits (U+06f0...U+06f9).
     * @stable ICU 2.0
     */
    ArabicShaping.DIGIT_TYPE_AN_EXTENDED = DIGIT_TYPE_AN_EXTENDED;


    var DIGIT_TYPE_MASK = 0x0100; // 0x3f00?
    /**
     * Bit mask for digit type options.
     * @stable ICU 2.0
     */
    ArabicShaping.DIGIT_TYPE_MASK = DIGIT_TYPE_MASK;

    /**
     * Converts a string to character code array.
     * @param {String} text
     * @return {Array} Character code array
     */
    ArabicShaping.prototype.toCharArray = function(text) {
        var chars = [];
        for (var i = 0; i < text.length; i++) {
            chars.push(text.charCodeAt(i));
        }
        return chars;
    };

    /**
     * Converts character code array to string
     * @param {Array} Character codes
     * @return {String}
     */
    ArabicShaping.prototype.fromCharArray = function(chars) {
        return String.fromCharCode.apply(String, chars);
    };

    /**
     * Convert a range of text in the source array, putting the result
     * into a range of text in the destination array, and return the number
     * of characters written.
     *
     * @param source An array containing the input text
     * @param sourceStart The start of the range of text to convert
     * @param sourceLength The length of the range of text to convert
     * @param dest The destination array that will receive the result.
     *   It may be <code>NULL</code> only if  <code>destSize</code> is 0.
     * @param destStart The start of the range of the destination buffer to use.
     * @param destSize The size (capacity) of the destination buffer.
     *   If <code>destSize</code> is 0, then no output is produced,
     *   but the necessary buffer size is returned ("preflighting").  This
     *   does not validate the text against the options, for example,
     *   if letters are being unshaped, and spaces are being consumed
     *   following lamalef, this will not detect a lamalef without a
     *   corresponding space.  An error will be thrown when the actual
     *   conversion is attempted.
     * @return The number of chars written to the destination buffer.
     *   If an error occurs, then no output was written, or it may be
     *   incomplete.
     * @throws DeveloperError if the text cannot be converted according to the options.
     * @stable ICU 2.0
     */
    ArabicShaping.prototype.shapeRange = function(source, sourceStart, sourceLength, dest, destStart, destSize) {
        if (source === null) {
            throw new DeveloperError("source can not be null");
        }
        if (sourceStart < 0 || sourceLength < 0 || sourceStart + sourceLength > source.length) {
            throw new DeveloperError("bad source start (" + sourceStart + ") or length (" + sourceLength + ") for buffer of length " + source.length);
        }
        if (dest === null && destSize !== 0) {
            throw new DeveloperError("null dest requires destSize === 0");
        }
        if ((destSize !== 0) &&
            (destStart < 0 || destSize < 0 || destStart + destSize > dest.length)) {
            throw new DeveloperError("bad dest start (" + destStart + ") or size (" + destSize + ") for buffer of length " + dest.length);
        }        /* Validate input options */
        if (((this.options & TASHKEEL_MASK) > 0) &&
            !(((this.options & TASHKEEL_MASK) === TASHKEEL_BEGIN) ||
                ((this.options & TASHKEEL_MASK) === TASHKEEL_END) ||
                ((this.options & TASHKEEL_MASK) === TASHKEEL_RESIZE) ||
                ((this.options & TASHKEEL_MASK) === TASHKEEL_REPLACE_BY_TATWEEL))) {
            throw new DeveloperError("Wrong Tashkeel argument");
        }
        ///CLOVER:OFF
        //According to Steven Loomis, the code is unreachable when you OR all the constants within the if statements
        if (((this.options & LAMALEF_MASK) > 0) &&
            !(((this.options & LAMALEF_MASK) === LAMALEF_BEGIN) ||
                ((this.options & LAMALEF_MASK) === LAMALEF_END) ||
                ((this.options & LAMALEF_MASK) === LAMALEF_RESIZE) ||
                ((this.options & LAMALEF_MASK) === LAMALEF_AUTO) ||
                ((this.options & LAMALEF_MASK) === LAMALEF_NEAR))) {
            throw new DeveloperError("Wrong Lam Alef argument");
        }
        ///CLOVER:ON
        /* Validate Tashkeel (Tashkeel replacement options should be enabled in shaping mode only)*/
        if (((this.options & TASHKEEL_MASK) > 0) && (this.options & LETTERS_MASK) === LETTERS_UNSHAPE) {
            throw new DeveloperError("Tashkeel replacement should not be enabled in deshaping mode ");
        }
        return internalShape(this, source, sourceStart, sourceLength, dest, destStart, destSize);
    };

    /**
     * Convert a range of text in place.  This may only be used if the Length option
     * does not grow or shrink the text.
     *
     * @param source An array containing the input text
     * @param start The start of the range of text to convert
     * @param length The length of the range of text to convert
     * @throws DeveloperError if the text cannot be converted according to the options.
     * @stable ICU 2.0
     */
    ArabicShaping.prototype.shapeInPlace = function(source, start, length) {
        if ((this.options & LAMALEF_MASK) === LAMALEF_RESIZE) {
            throw new DeveloperError("Cannot shape in place with length option resize.");
        }
        this.shapeRange(source, start, length, source, start, length);
    };

    /**
     * Convert a string, returning the new string.
     *
     * @param {String} text the string to convert
     * @return {String} the converted string
     * @throws DeveloperError if the string cannot be converted according to the options.
     * @stable ICU 2.0
     */
    ArabicShaping.prototype.shape = function(text) {
        var src = this.toCharArray(text);
        var dest = src;
        if (((this.options & LAMALEF_MASK) === LAMALEF_RESIZE) &&
            ((this.options & LETTERS_MASK) === LETTERS_UNSHAPE)) {
            dest = []; // max
        }
        this.shapeRange(src, 0, src.length, dest, 0, dest.length);
        return this.fromCharArray(dest);
    };

    ArabicShaping.prototype.equals = function(rhs) {
        return defined(rhs) && rhs instanceof ArabicShaping
            && this._options === rhs._options;
    };

    return ArabicShaping;
});
