import type {Block, BlockGroup, Property} from '~/utils/blocks'
import type {ExpressionType} from '~/utils/types'
import {EventBlockType} from '~/utils/events'
import {isPropertyWithValue} from '~/utils/helpers'

export class Compiler {
    lines: string[] = []
    imports: Set<string> = new Set<string>()
    functions: string[] = []
    onReady: string[] = []
    indentation: number = 0
    expectedType?: ExpressionType
    eventContent: string[] = []
    isAsync?: boolean

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
        this.write('  ')
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
            this.isAsync = false
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
        output += '$w.onReady(async () => {'
        this.onReady.forEach(line => output += '\n  ' + line)
        output += '\n}'
        return output
    }

    writeJsonObject(obj: any) {
        this.writeLine('{')
        this.indent(() => {
            let first = true
            for (const [key, value] of Object.entries(obj)) {
                if (value) {
                    if (isPropertyWithValue(value)) {
                        if (!first) {
                            this.writeLine()
                        }
                        this.write(key + ': ')
                        this.writeProperty(value)
                        this.write(',')
                        first = false
                    } else if (Array.isArray(value)) {
                        if (!first) {
                            this.writeLine()
                        }
                        this.write(key + ': ')
                        this.writeJsonArray(value)
                        this.write(', ')
                        first = false
                    } else if (this.hasAnyProperties(value)) {
                        if (!first) {
                            this.writeLine()
                        }
                        this.write(key + ': ')
                        this.writeJsonObject(value)
                        this.write(', ')
                        first = false
                    }
                }
            }
        })
        this.writeLine()
        this.write('}')
    }

    writeJsonArray(arr: any[]) {
        this.write('[')
        let first = true
        for (const item of arr) {
            if (item) {
                if (isPropertyWithValue(item)) {
                    if (!first) {
                        this.write(', ')
                    }
                    this.writeProperty(item)
                    first = false
                } else if (this.hasAnyProperties(item)) {
                    if (!first) {
                        this.write(', ')
                    }
                    this.writeJsonObject(item)
                    first = false
                }
            }
        }
        this.write(']')
    }

    private hasAnyProperties(obj: any) {
        return Object.values(obj).some((value) => isPropertyWithValue(value))
    }
}
