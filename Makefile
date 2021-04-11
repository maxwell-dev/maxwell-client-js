.PHONY : default install build start test clean

NPM=npm

default: start

install:
	${NPM} install

build:
	${NPM} run build

start: install
	${NPM} run start

test:
	${NPM} run test

clean:
	${NPM} run-script clean
