/*global defineSuite*/
defineSuite([
        'Scene/processArabicText'
    ], function(
        processArabicText) {
    'use strict';

    it('full european', function(){
        expect(processArabicText('the brown fox jumps over the lazy dog! 0123456789')).toBe('the brown fox jumps over the lazy dog! 0123456789');
    });

    it('full arabic',function(){
        expect(processArabicText('س'+'ل'+'ا'+'م')).toEqual('سلام');
    });

});
