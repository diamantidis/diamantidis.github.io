module.exports = {
    plugins: [
        require('tailwindcss'),
        ...(process.env.JEKYLL_ENV == 'production'
            ? [require('cssnano')({ preset: 'default' })]
            : [])
    ]
}