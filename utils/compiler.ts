import type {Block, BlockGroup, Property} from '~/utils/blocks'
import type {ExpressionType} from '~/utils/types'
import {EventBlockType} from '~/utils/events'

export class Compiler {
    lines: string[] = []
    imports: string[] = []
    functions: string[] = []
    onReady: string[] = []
    indentation: number = 0
    expectedType?: ExpressionType
    eventContent: string[] = []

    write(str: string) {
        if (!this.lines.length) {
            this.lines.push('')
        }
        this.lines[this.lines.length - 1] += str
    }

    writeLine(str: string = '') {
        this.write(str)
        this.lines.push(' '.repeat(this.indentation))
    }

    writeAll(lines: string[]) {
        let first = true
        for (let line of lines) {
            if (!first) {
                this.writeLine()
            }
            this.write(line)
            first = false
        }
    }

    indent(action: () => void) {
        this.indentation += 2
        this.write(' '.repeat(this.indentation))
        action()
        this.indentation -= 2
    }

    writeProperty(prop: Property, required = true) {
        if (!prop.value) {
            if (required) {
                prop.error = 'This property is required'
            }
            this.write('undefined')
        } else {
            this.expectedType = prop.type
            if (this.expectedType === 'element') {
                this.write('$w(')
            }
            this.writeBlock(prop.value)
            if (this.expectedType === 'element') {
                this.write(')')
            }
            this.expectedType = undefined
        }
    }

    writeBlock(block: Block) {
        const type = getBlockTypeNow(block)
        if (!type) {
            // TODO error
        } else {
            type.compile(this, block.data)
        }
    }

    writeGroup(group: BlockGroup) {
        if (group.blocks[0] && getBlockTypeNow(group.blocks[0]) instanceof EventBlockType) {
            this.lines = []
            let first = true
            for (let block of group.blocks.slice(1)) {
                if (!first) {
                    this.writeLine()
                }
                this.writeBlock(block)
                first = false
            }

            this.eventContent = [...this.lines]
            this.lines = []
            getBlockTypeNow(group.blocks[0])?.compile(this, group.blocks[0].data)
            this.eventContent = []
        } else {
            this.write('{')
            if (group.blocks.length) {
                this.indent(() => {
                    for (let block of group.blocks) {
                        this.writeLine()
                        this.writeBlock(block)
                    }
                })
                this.writeLine()
            }
            this.write('}')
        }
    }

    flushToOnReady() {
        this.onReady.push(...this.lines)
        this.lines = []
    }

    createOutput() {
        let output = ''
        this.imports.forEach(imp => output += imp + '\n')
        output += '$w.onReady(() => {'
        this.onReady.forEach(line => output += '\n  ' + line)
        output += '\n}'
        return output
    }
}
