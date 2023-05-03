.PHONY : default install build start test clean

NPM=npm

default: build

install:
	${NPM} install

build:
	${NPM} run build

test:
	${NPM} run test

clean:
	${NPM} run-script clean
