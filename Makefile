.PHONY : default install start test clean

NPM=npm

default: start

install:
	${NPM} install

start: install
	${NPM} start

test:
	${NPM} test

clean:
	${NPM} run-script clean
