import { FileDropInputComponent } from './file-drop-input.component';


describe('FileDropInputComponent', () => {
  const component = new FileDropInputComponent();
  const event = {};
  const fileEntry = {};
  const item = {};
  beforeEach(() => {
    fileEntry['isDirectory'] = true;
    fileEntry['name'] = 'test file entry';
    item['webkitGetAsEntry'] = (() => fileEntry);
    event['dataTransfer'] = {};
    event['stopPropagation'] = (() => {});
    event['preventDefault'] = (() => {});
  });
  it('#01 onDropFiles: should send error if dropped a folder ', () => {
    event['dataTransfer'].items = [item];
    event['dataTransfer'].files = [item];
    component.onDropFiles(event);
    expect(event['error']).toEqual(`Folder (${fileEntry['name']}) is not supported.`);
  });
  it('#02 onDropFiles: should send error if dropped multiple folders ', () => {
    event['dataTransfer'].items = [item, item];
    event['dataTransfer'].files = [item, item];
    component.onDropFiles(event);
    expect(event['error']).toEqual('Multiple files/folders are not supported');
  });
  it('#03 onDropFiles: should send error if it is not either file or folder ', () => {
    const testEntry = {};
    const testItem = {};
    testEntry['isDirectory'] = false;
    testEntry['isFile'] = false;
    testEntry['name'] = 'test file entry';
    testItem['webkitGetAsEntry'] = (() => testEntry);
    event['dataTransfer'].items = [testItem];
    event['dataTransfer'].files = [testItem];
    component.onDropFiles(event);
    expect(event['error']).toEqual(`Internal error, can not get the type of the dropped item (${testEntry['name']}).`);
  });
  it('#04 onDropFiles: should send error if can not get the dropped file ', () => {
    event['dataTransfer'].items = [item];
    event['dataTransfer'].files = void 0;
    component.onDropFiles(event);
    expect(event['error']).toEqual('Internal error, can not get the dropped file.');
  });
});
