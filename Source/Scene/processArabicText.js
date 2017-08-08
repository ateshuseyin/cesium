/*global define*/
define([
        '../Core/defined',
        '../ThirdParty/ArabicShaping'
    ], function(
        defined,
        ArabicShaping){
       'use strict';

       var arabicShaping = new ArabicShaping(ArabicShaping.LAMALEF_RIGHT | ArabicShaping.LETTERS_SHAPE | ArabicShaping.TEXT_DIRECTION_VISUAL_RTL);

       function processArabicText(text) {
           if(!defined(text)){
               return text;
           }
           var chars = arabicShaping.toCharArray(text);
           var destChars = [];
           var start = 0;
           var length = 1;
           var ch;
           var inArabic = false;
           var offset = 0;
           for (var current = 0; current < chars.length; current++) {
               ch = chars[current];
               if (ch >= 0x0600 && ch <= 0x06FF) { // arabic
                   if (inArabic) {
                       length++;
                   } else {
                       start = current;
                       length = 1;
                       inArabic = true;
                   }
               } else { // latin
                   if (inArabic) {
                       inArabic = false;
                       var newLength = arabicShaping.shapeRange(chars, start, length, destChars, start + offset);
                       offset+= newLength - length;
                       start = current;
                       length = 1;
                   }
                   destChars[current + offset] = ch;
               }
           }

           if (inArabic) {
               arabicShaping.shapeRange(chars, start, length, destChars, start + offset);
           }

           return arabicShaping.fromCharArray(destChars);
       }

       return processArabicText;
});
