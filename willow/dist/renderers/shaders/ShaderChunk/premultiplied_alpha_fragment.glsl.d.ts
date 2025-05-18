declare const _default: "\n#ifdef PREMULTIPLIED_ALPHA\n\n\t// Get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.\n\tgl_FragColor.rgb *= gl_FragColor.a;\n\n#endif\n";
export default _default;
