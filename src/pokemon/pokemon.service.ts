import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';



@Injectable()
export class PokemonService {

  private defaultLimited:number;

  constructor( 

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,

   ){
    this.defaultLimited = this.configService.get<number>('defaultLimit')
    // console.log({ defaultLimited: this.configService.get<number>('defaultLimit') });
    
   }

  //   CREAR UN POKEMON
  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const  newPokemon = await this.pokemonModel.create( createPokemonDto )
      return newPokemon;
      
    } catch (error) {
      this.handleExeptions(error)
         
    }  
  }



  //   TRAE TODO LOS POKEMON PAGINADOS
  findAll( paginationDto: PaginationDto ) {

    const {limit= this.defaultLimited, offset = 0} = paginationDto;
    return this.pokemonModel.find( )
    .limit( limit )
    .skip( offset)
    .sort({
      no:1
    })
    .select('-__v')  
  }



  //   TRAER POR NUMERO, ID, NAME 
  async findOne( term: string ) {
    let pokemon: Pokemon;

    //  BUSQUEDA POR NO
    if(!isNaN( +term )){
      pokemon = await this.pokemonModel.findOne( { no: term } )
    }

    // BUSQUEDA POR MONGO ID
    if(!pokemon && isValidObjectId( term )){
      pokemon = await this.pokemonModel.findById( { _id: term } )
    }

    // BUSQUEDA POR NOMBRE DE POKEMON
    if( !pokemon ){ 
      pokemon = await this.pokemonModel.findOne( { name: term.toLowerCase().trim() } )
    }

    // ERROR POR SI NO ENCUENTRA UN POKEMON
    if(!pokemon)
      throw new NotFoundException(` Pokemon with id, name or no "${ term }" not found`)

    return pokemon;
  }




  //   ACTUALIZAR UN POKEMON
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
      if( updatePokemonDto.name )
         updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {

          await pokemon.updateOne( updatePokemonDto );
          return {...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleExeptions(error)
    }
    
  }




  //   ELIMINAR POKEMON
  async remove(id: string) {

      const { deletedCount }  =   await this.pokemonModel.deleteOne({ _id: id});
      if( deletedCount === 0)
        throw new BadRequestException(`Pokemon with Id ¨${ id }¨ not found `);
      return `${id} has been successfully removed`;
  }





  private handleExeptions( error: any ){

    if( error.code === 11000 ){
      throw new BadRequestException( `Pokemon exists in DB ${ JSON.stringify( error.keyValue) }`  );
    }
    console.log(error);
    throw new InternalServerErrorException( ` Can't create Pokemon  - Check server logs` )
    
  }
}
