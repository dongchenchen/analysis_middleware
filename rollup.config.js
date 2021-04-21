import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/analysis_middleware.dev.js',
      format: 'umd',
      name: 'AnalysisMiddleware'
    },
    plugins: [
      typescript(),
      json({
        include: 'package.json',
      }),
      replace({
        exclude: 'node_modules/**',
        IS_PROD: false,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/analysis_middleware.js',
      format: 'umd',
      name: 'AnalysisMiddleware'
    },
    plugins: [
      typescript(),
      json({
        include: 'package.json',
      }),
      replace({
        exclude: 'node_modules/**',
        IS_PROD: true,
      }),
    ],
  },
  {
    input: 'dist/analysis_middleware.js',
    output: {
      file: 'dist/analysis_middleware.min.js',
      format: 'umd',
      name: 'AnalysisMiddleware'
    },
    plugins: [
      uglify(),
    ],
  },
]