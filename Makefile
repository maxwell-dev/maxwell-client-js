.PHONY : default install build start test clean

NPM=npm

default: build

install:
	${NPM} install

build:
	${NPM} run build

pack:
	${NPM} run pack

test:
	${NPM} run test

clean:
	${NPM} run-script clean
