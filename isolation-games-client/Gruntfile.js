module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'app',
                    keepalive: true,
                    debug: true,
                    open: true
                }
            }
        },
        //Kopiere die Bibliotheken aus node_modules in das lib Verzeichnis 
        //um sie danach via index.html einzubinden.
        copy: {
            main: {
                files: [
                    {expand: true,
                        cwd: 'node_modules/angular',
                        src: '**',
                        dest: 'app/lib/angular'},
                    {expand: true,
                        cwd: 'node_modules/angular-loader',
                        src: '**',
                        dest: 'app/lib/angular-loader'},
                    {expand: true,
                        cwd: 'node_modules/angular-websocket',
                        src: '**',
                        dest: 'app/lib/angular-websocket'},
                    {expand: true,
                        cwd: 'node_modules/angular-mocks',
                        src: '**',
                        dest: 'app/lib/angular-mocks'},
                    {expand: true,
                        cwd: 'node_modules/angular-route',
                        src: '**',
                        dest: 'app/lib/angular-route'},
                    {expand: true,
                        cwd: 'node_modules/bootstrap/dist',
                        src: '**/*.min.*',
                        dest: 'app/lib/bootstrap'},
                    {expand: true,
                        cwd: 'node_modules/bootstrap-icons/icons',
                        src: '**/*.svg',
                        dest: 'app/lib/bootstrap-icons'},
                    {expand: true,
                        cwd: 'node_modules/jquery/dist',
                        src: '**/*.min.*',
                        dest: 'app/lib/jquery'},
                    {expand: true,
                        cwd: 'node_modules/font-awesome/css',
                        src: '**/*.min.*',
                        dest: 'app/styles/extern/font-awesome'},
                    {expand: true,
                        cwd: 'node_modules/font-awesome/fonts',
                        src: '**',
                        dest: 'app/styles/extern/fonts'},
                    {expand: true,
                        cwd: 'node_modules/font-awesome/fonts',
                        src: '**',
                        dest: 'app/fonts'},
                    {expand: true,
                        cwd: 'node_modules/angular-i18n',
                        src: 'angular-locale_de-de.js',
                        dest: 'app/lib/i18n/'}                  
                ]
            },

            //Task der die Quelldateien in das Target Directory verschiebt.
            //Die Dateien werden dann aus dem Target Directory in das Zip (Assembly) gepackt.
            //Das lib Verzeichnis wird nicht eingepackt, da alle enthaltenen Dateien konkateniert werden
            //und gesondert eingebunden sind.
            //
            //Ferner packe das /api Verzeichnis nicht mit ein, da es nur Testdaten sind (Restendpunkte)
            target: {
                files: [
                    {expand: true,
                        cwd: 'app',
                        src: ['**'],
                        dest: 'target/'}
                ]
            }
        },

        clean: {
            build: {
                src: ['target']
            },
            lib:{
                src: ['app/lib']
            },
            styles:{
                src: ['app/styles/extern']
            }

        }});

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', 'build');

    // simple build task
    grunt.registerTask('build', [
        'clean:build',
        'clean:lib',
        'clean:styles',
        'copy:main',
        'copy:target'
    ]);

};
