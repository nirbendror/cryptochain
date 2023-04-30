const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain()', () => {
    let blockchain, newChain, originalChain;
    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
      });

    it('contains a chain Array', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('start with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('add a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length -1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        })

        describe('when the chain start with the genesis block and has multiple blicks', () => {
            beforeEach(() =>  {
                blockchain.addBlock({data: 'Beers'});
                blockchain.addBlock({data: 'Beets'});
                blockchain.addBlock({data: 'Battelestar Galactica'});
            })
            describe('and a last hash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'some-bad-and-evil-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and the chain does not contains any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                })
            })
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;
        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock;
        })
        describe('new chain is not longet', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            })
          it('does not replae the chain', () => {
            expect(blockchain.chain).toEqual(originalChain);
          });  
          it('logs an error', () => {
            expect(errorMock).toHaveBeenCalled()
          })
        });
        describe('when the chain is longer', () => {
            beforeEach(() =>  {
                newChain.addBlock({data: 'Beers'});
                newChain.addBlock({data: 'Beets'});
                newChain.addBlock({data: 'Battelestar Galactica'});
            })
            describe('when the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                })
                it('does not replae the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain)
                });  
                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled()
                  })
            });
            describe('when the chain is valid', () => {
                beforeEach(() =>  {
                    blockchain.replaceChain(newChain.chain);
                })
                it('does replae the chain', () => {
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                });  
                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                })
            });
        });
    });
});